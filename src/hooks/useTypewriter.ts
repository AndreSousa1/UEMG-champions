import { useEffect, useState } from 'react';

interface TypewriterTiming {
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  pauseMs?: number;
}

interface TypewriterState {
  index: number;
  length: number;
  deleting: boolean;
}

/**
 * Escreve e apaga as palavras em sequência, em loop. Começa com a primeira
 * palavra completa para não haver texto vazio no primeiro quadro.
 * `words` precisa ser uma referência estável (useMemo).
 */
export function useTypewriter(words: readonly string[], enabled: boolean, timing: TypewriterTiming = {}): string {
  const { typeMs = 85, deleteMs = 45, holdMs = 2600, pauseMs = 380 } = timing;
  const [state, setState] = useState<TypewriterState>(() => ({
    index: 0,
    length: Array.from(words[0] ?? '').length,
    deleting: false,
  }));

  const chars = Array.from(words[state.index % Math.max(words.length, 1)] ?? '');

  useEffect(() => {
    if (!enabled || words.length === 0) return;
    let delay: number;
    let next: TypewriterState;
    if (!state.deleting && state.length >= chars.length) {
      delay = holdMs;
      next = { ...state, deleting: true };
    } else if (state.deleting && state.length === 0) {
      delay = pauseMs;
      next = { index: (state.index + 1) % words.length, length: 0, deleting: false };
    } else {
      delay = state.deleting ? deleteMs : typeMs;
      next = { ...state, length: state.length + (state.deleting ? -1 : 1) };
    }
    const timer = setTimeout(() => setState(next), delay);
    return () => clearTimeout(timer);
  }, [state, words, enabled, chars.length, typeMs, deleteMs, holdMs, pauseMs]);

  if (!enabled) return words.join(' · ');
  return chars.slice(0, state.length).join('');
}
