import { Download, LogOut, RotateCcw, Save, X } from 'lucide-react';
import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { checkAdminCredentials, isAdminSession, setAdminSession } from '../../lib/admin-auth';
import { cloneData, downloadTournamentData, sourceData, type TournamentData } from '../../lib/tournament-data';
import { Field, inputClass } from './fields';
import { MatchesEditor } from './MatchesEditor';
import { ResultsEditor } from './ResultsEditor';
import { SponsorsEditor } from './SponsorsEditor';
import { TeamsEditor } from './TeamsEditor';

type View = 'closed' | 'login' | 'panel';
type Tab = 'results' | 'teams' | 'matches' | 'sponsors';

const TABS: { id: Tab; label: string }[] = [
  { id: 'results', label: 'Resultados' },
  { id: 'teams', label: 'Equipes' },
  { id: 'matches', label: 'Partidas' },
  { id: 'sponsors', label: 'Patrocinadores' },
];

interface AdminGateProps {
  data: TournamentData;
  onSave: (next: TournamentData) => void;
  onReset: () => void;
  /** Abre o login na primeira renderização (testes). */
  defaultOpen?: boolean;
}

export function AdminGate({ data, onSave, onReset, defaultOpen = false }: AdminGateProps) {
  const titleId = useId();
  const [view, setView] = useState<View>(() => {
    if (!defaultOpen) return 'closed';
    return isAdminSession() ? 'panel' : 'login';
  });
  const [tab, setTab] = useState<Tab>('results');
  const [draft, setDraft] = useState(() => cloneData(data));
  const [dataRef, setDataRef] = useState(data);
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  if (data !== dataRef) {
    setDataRef(data);
    setDraft(cloneData(data));
  }

  const dirty = JSON.stringify(draft) !== JSON.stringify(data);

  const requestClose = useCallback(() => {
    if (view === 'panel' && dirty && !window.confirm('Descartar alterações ainda não aplicadas no site?')) return;
    setView('closed');
    setError('');
    setNotice('');
    setPassword('');
  }, [view, dirty]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || !event.shiftKey || event.code !== 'KeyL') return;
      event.preventDefault();
      setView((current) => {
        if (current !== 'closed') return 'closed';
        return isAdminSession() ? 'panel' : 'login';
      });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (view === 'closed') return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      requestClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [requestClose, view]);

  useEffect(() => {
    if (view === 'closed') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [view]);

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (!checkAdminCredentials(user, password)) {
      setError('Usuário ou senha incorretos.');
      return;
    }
    setAdminSession(true);
    setView('panel');
    setError('');
    setPassword('');
    setNotice('');
  };

  const apply = () => {
    onSave(cloneData(draft));
    setNotice('Alterações aplicadas neste navegador. Baixe o JSON para gravá-las no projeto.');
  };

  const reset = () => {
    if (!window.confirm('Restaurar o arquivo original e descartar as edições deste navegador?')) return;
    onReset();
    setDraft(cloneData(sourceData));
    setNotice('Dados restaurados a partir de tournament.json.');
  };

  const logout = () => {
    if (dirty && !window.confirm('Sair e descartar alterações ainda não aplicadas?')) return;
    setAdminSession(false);
    setView('closed');
    setUser('');
    setPassword('');
    setNotice('');
  };

  if (view === 'closed') return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink-950/80 p-3 backdrop-blur-md sm:p-6" role="presentation" onClick={requestClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(94dvh,920px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line-strong bg-ink-900 shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
        onClick={(event) => event.stopPropagation()}
      >
        {view === 'login' ? (
          <form onSubmit={login} className="mx-auto w-full max-w-sm space-y-5 px-6 py-10 sm:px-10">
            <div>
              <p className="eyebrow mb-1">Organização</p>
              <h2 id={titleId} className="font-display text-3xl font-bold tracking-wide uppercase">
                Acesso ao painel
              </h2>
            </div>
            <Field label="Usuário">
              <input className={inputClass} autoComplete="username" autoFocus value={user} onChange={(e) => setUser(e.target.value)} />
            </Field>
            <Field label="Senha">
              <input className={inputClass} type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>
            {error && <p className="text-sm text-live">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary flex-1">
                Entrar
              </button>
              <button type="button" className="btn btn-ghost" onClick={requestClose}>
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <>
            <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
              <div>
                <p className="eyebrow mb-1">Organização</p>
                <h2 id={titleId} className="font-display text-2xl font-bold tracking-wide uppercase sm:text-3xl">
                  Painel de dados
                </h2>
              </div>
              <button type="button" onClick={requestClose} className="-mr-2 rounded-lg p-2 text-fg-muted hover:bg-white/5 hover:text-fg" aria-label="Fechar">
                <X className="size-5" />
              </button>
            </header>

            <nav className="flex gap-1 overflow-x-auto border-b border-line px-5 py-2 sm:px-7" aria-label="Seções do painel">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`rounded-lg px-3 py-2 text-sm font-semibold tracking-wide uppercase ${tab === item.id ? 'bg-accent/15 text-accent' : 'text-fg-muted hover:bg-white/5 hover:text-fg'}`}
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              {tab === 'results' && <ResultsEditor data={draft} onChange={setDraft} />}
              {tab === 'teams' && <TeamsEditor data={draft} onChange={setDraft} />}
              {tab === 'matches' && <MatchesEditor data={draft} onChange={setDraft} />}
              {tab === 'sponsors' && <SponsorsEditor data={draft} onChange={setDraft} />}
            </div>

            <footer className="space-y-3 border-t border-line px-5 py-4 sm:px-7">
              {notice && <p className="text-sm text-accent">{notice}</p>}
              {dirty && <p className="text-sm text-warn">Há alterações ainda não aplicadas no site.</p>}
              <p className="text-xs text-fg-dim">
                O site é estático: aplicar atualiza este navegador. Para publicar, baixe <code className="text-fg-muted">tournament.json</code> e substitua{' '}
                <code className="text-fg-muted">src/data/tournament.json</code>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-primary" onClick={apply} disabled={!dirty}>
                  <Save className="size-4" />
                  Aplicar no site
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => downloadTournamentData(draft)}>
                  <Download className="size-4" />
                  Baixar JSON
                </button>
                <button type="button" className="btn btn-ghost" onClick={reset}>
                  <RotateCcw className="size-4" />
                  Restaurar original
                </button>
                <button type="button" className="btn btn-ghost ml-auto" onClick={logout}>
                  <LogOut className="size-4" />
                  Sair
                </button>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
