import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  children: ReactNode;
}

/** Modal acessível baseado no elemento nativo <dialog> (foco, Esc e backdrop). */
export function Dialog({ open, onClose, title, eyebrow, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);
  const titleId = useId();

  useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={() => {
        // Fechamentos programáticos (troca de modal) não devem limpar a nova seleção.
        if (openRef.current) onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className="m-auto max-h-[min(88dvh,820px)] w-[min(94vw,720px)] overflow-hidden rounded-2xl border border-line-strong bg-ink-900 p-0 text-fg shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)] open:animate-fade-up"
    >
      {open && (
        <div className="flex max-h-[min(88dvh,820px)] flex-col">
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4 sm:px-7">
            <div className="min-w-0">
              {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
              <h2 id={titleId} className="font-display text-2xl leading-tight font-bold tracking-wide uppercase sm:text-3xl">
                {title}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 shrink-0 rounded-lg p-2 text-fg-muted transition hover:bg-white/5 hover:text-fg"
              aria-label="Fechar"
            >
              <X className="size-5" />
            </button>
          </header>
          <div className="scrollbar-thin overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">{children}</div>
        </div>
      )}
    </dialog>
  );
}
