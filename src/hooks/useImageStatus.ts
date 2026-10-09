import { useCallback, useSyncExternalStore } from 'react';

type ImageStatus = 'loading' | 'loaded' | 'error';

const statuses = new Map<string, ImageStatus>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function load(src: string) {
  if (statuses.has(src) || typeof Image === 'undefined') return;
  statuses.set(src, 'loading');
  const img = new Image();
  img.onload = () => {
    statuses.set(src, 'loaded');
    emit();
  };
  img.onerror = () => {
    statuses.set(src, 'error');
    emit();
  };
  img.src = src;
}

/**
 * Verifica se uma imagem existe antes de exibi-la. Enquanto carrega ou se
 * falhar, o componente mostra a versão de contingência (texto/monograma).
 */
export function useImageStatus(src: string | null): ImageStatus {
  const subscribe = useCallback(
    (listener: () => void) => {
      if (src) load(src);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    [src],
  );
  return useSyncExternalStore(
    subscribe,
    () => (src ? (statuses.get(src) ?? 'loading') : 'error'),
    () => 'loading',
  );
}
