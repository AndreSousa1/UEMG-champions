import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../App';
import { AdminGate } from '../components/admin/AdminGate';
import { checkAdminCredentials, isAdminSession, setAdminSession, ADMIN_SESSION_KEY } from '../lib/admin-auth';
import { cloneData, loadTournamentData, saveTournamentData, clearTournamentData, STORAGE_KEY, sourceData } from '../lib/tournament-data';
import { build } from './helpers';

const BEFORE_EVENT = new Date('2026-10-08T22:00:00-03:00');

function mockWebStorage() {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => memory.clear(),
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
  return memory;
}

describe('autenticação do painel', () => {
  beforeEach(() => mockWebStorage());

  it('aceita o usuário e a senha da organização', () => {
    expect(checkAdminCredentials('uemg', 'champs')).toBe(true);
    expect(checkAdminCredentials('UEMG', 'champs')).toBe(true);
    expect(checkAdminCredentials('uemg', 'errado')).toBe(false);
    expect(checkAdminCredentials('', 'champs')).toBe(false);
  });

  it('guarda a sessão só neste navegador', () => {
    expect(isAdminSession()).toBe(false);
    setAdminSession(true);
    expect(isAdminSession()).toBe(true);
    expect(sessionStorage.getItem(ADMIN_SESSION_KEY)).toBe('1');
    setAdminSession(false);
    expect(isAdminSession()).toBe(false);
  });
});

describe('arquivo de dados e overlay local', () => {
  let memory: Map<string, string>;

  beforeEach(() => {
    memory = mockWebStorage();
  });

  afterEach(() => {
    memory.clear();
  });

  it('carrega o JSON publicado quando não há overlay', () => {
    const loaded = loadTournamentData();
    expect(loaded.teams).toHaveLength(12);
    expect(loaded.matches).toHaveLength(11);
    expect(loaded.sponsors[0]?.id).toBe('n1-skins');
  });

  it('grava e relê alterações sem mutar a fonte', () => {
    const next = cloneData(sourceData);
    const team = next.teams.find((item) => item.id === 'A');
    if (team) team.name = 'Equipe de teste';
    saveTournamentData(next);
    expect(memory.get(STORAGE_KEY)).toContain('Equipe de teste');
    expect(sourceData.teams.find((item) => item.id === 'A')?.name).not.toBe('Equipe de teste');
    expect(loadTournamentData().teams.find((item) => item.id === 'A')?.name).toBe('Equipe de teste');
    clearTournamentData();
    expect(loadTournamentData().teams.find((item) => item.id === 'A')?.name).not.toBe('Equipe de teste');
  });
});

describe('interface do painel', () => {
  it('não aparece no site público', () => {
    const html = renderToString(<App model={build()} fixedNow={BEFORE_EVENT} />);
    expect(html).not.toContain('Acesso ao painel');
    expect(html).not.toContain('Painel de dados');
  });

  it('mostra o login quando o atalho abre a tela', () => {
    const html = renderToString(<AdminGate data={sourceData} onSave={() => {}} onReset={() => {}} defaultOpen />);
    expect(html).toContain('Acesso ao painel');
    expect(html).toContain('Usuário');
    expect(html).toContain('Senha');
    expect(html).toContain('Entrar');
  });
});
