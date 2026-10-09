const loadedAt = Date.now();

/**
 * Relógio do site. Com `clockOverride`, o tempo começa na data simulada e
 * continua correndo normalmente, o que permite pré-visualizar o evento.
 */
export function createClock(override: string | null): () => Date {
  if (!override) return () => new Date();
  const target = Date.parse(override);
  if (Number.isNaN(target)) return () => new Date();
  const offset = target - loadedAt;
  return () => new Date(Date.now() + offset);
}
