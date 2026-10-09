/**
 * Importa nomes de equipes e nicknames a partir de um CSV/JSON SANITIZADO.
 *
 * Uso:
 *   npm run import:teams -- caminho/arquivo.csv              (apenas confere e mostra a prévia)
 *   npm run import:teams -- caminho/arquivo.csv --escrever   (grava src/data/teams.ts)
 *   npm run import:teams -- https://.../export.csv           (URL pública com apenas colunas autorizadas)
 *
 * O arquivo é processado localmente; nada é enviado ao navegador além do
 * resultado final em src/data/teams.ts.
 */
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ALLOWED_COLUMNS, importTeams, renderTeamsFile } from '../src/lib/team-import.ts';
import type { TeamDefinition } from '../src/types/tournament.ts';

const root = resolve(fileURLToPath(import.meta.url), '../..');
const teamsFile = resolve(root, 'src/data/teams.ts');

async function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--escrever');
  const source = args.find((a) => !a.startsWith('--'));

  if (!source) {
    console.log('Uso: npm run import:teams -- <arquivo.csv|arquivo.json|URL> [--escrever]');
    console.log(`Colunas aceitas: ${ALLOWED_COLUMNS.join(', ')}`);
    process.exit(1);
  }

  let content: string;
  let format: 'csv' | 'json';
  if (/^https?:\/\//i.test(source)) {
    const response = await fetch(source);
    if (!response.ok) throw new Error(`Não foi possível baixar ${source} (HTTP ${response.status}).`);
    content = await response.text();
    format = content.trimStart().startsWith('[') ? 'json' : 'csv';
  } else {
    content = await readFile(resolve(process.cwd(), source), 'utf8');
    format = extname(source).toLowerCase() === '.json' ? 'json' : 'csv';
  }

  const { teams } = (await import(pathToFileURL(teamsFile).href)) as { teams: readonly TeamDefinition[] };
  const report = importTeams({ format, content }, teams);

  for (const warning of report.warnings) console.log(`AVISO: ${warning}`);
  if (!report.ok) {
    for (const error of report.errors) console.error(`ERRO: ${error}`);
    console.error('\nNenhum arquivo foi alterado. Corrija os erros e execute novamente.');
    process.exit(1);
  }

  console.log('\nPrévia da importação:');
  for (const team of report.summary) {
    console.log(`  [${team.teamId}] ${team.name}: ${team.players.join(', ') || '(sem titulares)'}${team.reserve ? ` | reserva: ${team.reserve}` : ''}`);
  }

  if (!write) {
    console.log('\nModo de conferência: nada foi gravado. Use --escrever para atualizar src/data/teams.ts.');
    return;
  }

  await copyFile(teamsFile, `${teamsFile}.bak`);
  await writeFile(teamsFile, renderTeamsFile(report.teams), 'utf8');
  console.log(`\nsrc/data/teams.ts atualizado (cópia anterior em src/data/teams.ts.bak).`);
}

main().catch((error: unknown) => {
  console.error(`ERRO: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
