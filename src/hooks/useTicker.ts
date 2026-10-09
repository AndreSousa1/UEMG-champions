import { useEffect, useState } from 'react';

/** Reavalia `read` a cada intervalo (ex.: contagem regressiva por segundo). */
export function useTicker<T>(read: () => T, intervalMs: number): T {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const id = window.setInterval(() => setValue(read()), intervalMs);
    return () => window.clearInterval(id);
  }, [read, intervalMs]);
  return value;
}
