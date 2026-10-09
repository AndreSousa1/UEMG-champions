import { AlertTriangle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useTournament } from '../../state/context';

/**
 * Aviso exibido quando os arquivos de dados têm inconsistências. Nesses casos
 * o site não avança equipes nas partidas afetadas até a correção.
 */
export function IssuesBanner() {
  const { model } = useTournament();
  const [expanded, setExpanded] = useState(false);
  const { issues } = model;
  if (issues.length === 0) return null;

  const errors = issues.filter((i) => i.severity === 'error').length;

  return (
    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8" role="status">
      <div className="rounded-xl border border-warn/30 bg-warn/[0.06] text-sm">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <AlertTriangle className="size-5 shrink-0 text-warn" aria-hidden="true" />
          <span className="flex-1 text-fg">
            <strong className="font-semibold">Dados do campeonato em revisão.</strong>{' '}
            <span className="text-fg-muted">
              {errors > 0
                ? `${errors} ${errors === 1 ? 'inconsistência impede' : 'inconsistências impedem'} a atualização automática de parte do chaveamento.`
                : `${issues.length} ${issues.length === 1 ? 'ponto' : 'pontos'} de atenção na configuração.`}
            </span>
          </span>
          <ChevronDown className={`size-4 shrink-0 text-fg-muted transition ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {expanded && (
          <ul className="space-y-1.5 border-t border-warn/20 px-4 py-3 text-fg-muted">
            {issues.map((issue) => (
              <li key={`${issue.severity}-${issue.message}`} className="flex gap-2">
                <span className={issue.severity === 'error' ? 'text-live' : 'text-warn'} aria-hidden="true">
                  ●
                </span>
                <span>
                  <span className="sr-only">{issue.severity === 'error' ? 'Erro: ' : 'Aviso: '}</span>
                  {issue.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
