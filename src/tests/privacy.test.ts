import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { teams } from '../data/teams';
import { SENSITIVE_VALUE_PATTERNS } from '../lib/privacy';
import { importTeams, renderTeamsFile } from '../lib/team-import';
import { findSensitiveData } from '../lib/validation';

const root = fileURLToPath(new URL('../..', import.meta.url));

function filesIn(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? filesIn(full) : [full];
  });
}

const FORBIDDEN_KEYS = /\b(cpf|matricula|matrícula|email|e-mail|telefone|whatsapp|celular|steamId|steam_id|nomeCompleto|fullName)\s*:/i;

describe('privacidade dos dados públicos', () => {
  it('as equipes não contêm campos ou valores pessoais', () => {
    expect(findSensitiveData(teams)).toEqual([]);
    const json = JSON.stringify(teams);
    for (const { pattern } of SENSITIVE_VALUE_PATTERNS) expect(json).not.toMatch(pattern);
  });

  it('os arquivos públicos de dados e configuração não têm CPF, matrícula, e-mail ou telefone', () => {
    const files = [...filesIn(join(root, 'src/data')), join(root, 'src/config/tournament.config.ts'), ...filesIn(join(root, 'public'))];
    for (const file of files.filter((f) => /\.(ts|json|csv|txt|html)$/.test(f))) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(FORBIDDEN_KEYS);
      for (const { label, pattern } of SENSITIVE_VALUE_PATTERNS) {
        expect(pattern.test(text), `${file} parece conter ${label}`).toBe(false);
      }
    }
  });

  it('detecta dados pessoais caso sejam incluídos nas equipes', () => {
    const leaked = [{ ...teams[0], cpf: '123.456.789-09', players: [{ nickname: 'aluno@exemplo.com' }] }];
    const problems = findSensitiveData(leaked as never);
    expect(problems.some((p) => p.includes('cpf'))).toBe(true);
    expect(problems.some((p) => p.includes('e-mail'))).toBe(true);
  });
});

describe('importação de equipes', () => {
  const header = 'equipe_id,equipe_nome,equipe_sigla,nickname,funcao,ordem,publicar';

  it('recusa arquivos com colunas pessoais (CPF, matrícula, e-mail)', () => {
    const csv = `equipe_id,equipe_nome,nickname,publicar,CPF,Matrícula,E-mail\nA,Teste,nick,sim,000.000.000-00,123,a@b.com`;
    const report = importTeams({ format: 'csv', content: csv }, teams);
    expect(report.ok).toBe(false);
    expect(report.teams).toEqual([]);
    expect(report.errors[0]).toContain('dados pessoais');
  });

  it('recusa colunas desconhecidas e linhas sem equipe válida', () => {
    expect(importTeams({ format: 'csv', content: `${header},curso_extra\nA,T,T,n,titular,1,sim,x` }, teams).ok).toBe(false);
    const report = importTeams({ format: 'csv', content: `${header}\nZ,Time,T,nick,titular,1,sim` }, teams);
    expect(report.ok).toBe(false);
    expect(report.errors[0]).toContain('equipe_id');
  });

  it('não supõe a ordem das linhas: usa o equipe_id explícito', () => {
    const csv = `${header}\nL,EXEMPLO Lima,EXL,ex_l1,titular,1,sim\nA,EXEMPLO Alfa,EXA,ex_a1,titular,1,sim`;
    const report = importTeams({ format: 'csv', content: csv }, teams);
    expect(report.ok).toBe(true);
    expect(report.teams.find((t) => t.id === 'L')?.name).toBe('EXEMPLO Lima');
    expect(report.teams.find((t) => t.id === 'A')?.name).toBe('EXEMPLO Alfa');
    expect(report.teams.find((t) => t.id === 'B')?.name).toBe(teams.find((t) => t.id === 'B')?.name);
  });

  it('omite jogadores sem autorização e ordena pelo campo "ordem"', () => {
    const csv = `${header}\nA,EXEMPLO,EX,ex_b,titular,2,sim\nA,EXEMPLO,EX,ex_a,titular,1,sim\nA,EXEMPLO,EX,ex_oculto,titular,3,não\nA,EXEMPLO,EX,ex_res,reserva,,sim`;
    const report = importTeams({ format: 'csv', content: csv }, teams);
    const team = report.teams.find((t) => t.id === 'A')!;
    expect(team.players.map((p) => p.nickname)).toEqual(['ex_a', 'ex_b']);
    expect(team.reserve?.nickname).toBe('ex_res');
    expect(JSON.stringify(report.teams)).not.toContain('ex_oculto');
  });

  it('recusa nicknames que parecem e-mail ou CPF e nomes divergentes', () => {
    expect(importTeams({ format: 'csv', content: `${header}\nA,EX,EX,fulano@uemg.br,titular,1,sim` }, teams).ok).toBe(false);
    expect(importTeams({ format: 'csv', content: `${header}\nA,EX,EX,12345678909,titular,1,sim` }, teams).ok).toBe(false);
    expect(importTeams({ format: 'csv', content: `${header}\nA,EX1,EX,n1,titular,1,sim\nA,EX2,EX,n2,titular,2,sim` }, teams).ok).toBe(false);
  });

  it('aceita JSON e CSV com ";" e gera um teams.ts sem campos extras', () => {
    const json = JSON.stringify([{ equipe_id: 'C', equipe_nome: 'EXEMPLO Charlie', nickname: 'ex_c', publicar: 'sim' }]);
    const fromJson = importTeams({ format: 'json', content: json }, teams);
    expect(fromJson.ok).toBe(true);
    const fromSemicolon = importTeams({ format: 'csv', content: 'equipe_id;equipe_nome;nickname;publicar\nC;"EXEMPLO; Charlie";ex_c;sim' }, teams);
    expect(fromSemicolon.teams.find((t) => t.id === 'C')?.name).toBe('EXEMPLO; Charlie');

    const file = renderTeamsFile(fromJson.teams);
    expect(file).toContain("name: 'EXEMPLO Charlie'");
    expect(file).toContain('as const satisfies readonly TeamDefinition[]');
    expect(file).not.toMatch(FORBIDDEN_KEYS);
  });
});
