/** Padrões de dados pessoais que nunca devem aparecer no conjunto público. */
export const SENSITIVE_VALUE_PATTERNS: readonly { label: string; pattern: RegExp }[] = [
  { label: 'CPF', pattern: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/ },
  { label: 'e-mail', pattern: /[^\s@]+@[^\s@]+\.[^\s@]+/ },
  { label: 'telefone', pattern: /(?:\+?55\s?)?\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}\b/ },
];

/** Nomes de campos administrativos que não podem existir nos dados públicos. */
export const SENSITIVE_KEY_PATTERN =
  /cpf|matr[ií]cula|e-?mail|telefone|celular|fone|whats|contato|discord|steam|nome_?completo|full_?name|^nome$|^rg$|curso|nascimento|endere[cç]o/i;

export function sensitiveValueLabel(value: string): string | null {
  for (const { label, pattern } of SENSITIVE_VALUE_PATTERNS) {
    if (pattern.test(value)) return label;
  }
  return null;
}
