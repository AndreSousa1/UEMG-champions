import type { Sponsor, SponsorContact, SponsorSocialLink } from '../types/sponsor';
import type { ValidationIssue } from '../types/tournament';

/** Patrocinadores visíveis no site: apenas ativos, em ordem de `displayOrder` (empate: nome). */
export function activeSponsors(list: readonly Sponsor[]): Sponsor[] {
  return list
    .filter((s) => s.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name, 'pt-BR'));
}

export type WhatsAppLink = { ok: true; url: string; digits: string } | { ok: false; reason: string };

/**
 * Gera o link wa.me a partir de um número brasileiro. Aceita apenas números
 * completos: celular (DDD + 9 dígitos iniciados por 9) ou fixo (DDD + 8 dígitos
 * iniciados por 2–5). Nunca completa dígitos faltantes.
 */
export function buildWhatsAppUrl(phone: string, message?: string): WhatsAppLink {
  let digits = phone.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) digits = digits.slice(2);

  if (!/^[1-9]{2}/.test(digits)) return { ok: false, reason: 'DDD inválido.' };
  const local = digits.slice(2);
  const isMobile = local.length === 9 && local.startsWith('9');
  const isLandline = local.length === 8 && /^[2-5]/.test(local);
  if (!isMobile && !isLandline) {
    const reason =
      local.length === 8 && local.startsWith('9')
        ? 'O número parece ser um celular sem o nono dígito.'
        : `Número com ${digits.length} dígitos não corresponde a um telefone brasileiro completo.`;
    return { ok: false, reason };
  }

  const text = message?.trim();
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return { ok: true, url: `https://wa.me/55${digits}${query}`, digits: `55${digits}` };
}

export function isHttpsUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export interface ResolvedContact {
  id: string;
  kind: 'whatsapp' | 'link';
  label: string;
  href: string;
}

/** Converte um contato em link utilizável, ou null quando ele não pode ser exibido com segurança. */
export function resolveContact(contact: SponsorContact): ResolvedContact | null {
  if (contact.type === 'whatsapp') {
    if (!contact.confirmed) return null;
    const link = buildWhatsAppUrl(contact.phone, contact.message);
    return link.ok ? { id: contact.id, kind: 'whatsapp', label: contact.label, href: link.url } : null;
  }
  return isHttpsUrl(contact.url) ? { id: contact.id, kind: 'link', label: contact.label, href: contact.url } : null;
}

export function visibleSocialLinks(links: readonly SponsorSocialLink[]): SponsorSocialLink[] {
  return links.filter((l) => isHttpsUrl(l.url));
}

/** Problemas no cadastro (para os testes e para quem edita o arquivo); não aparecem no site. */
export function validateSponsors(list: readonly Sponsor[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();
  for (const sponsor of list) {
    const ref = `Patrocinador "${sponsor.id}"`;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sponsor.id)) issues.push({ severity: 'error', message: `${ref}: id deve usar letras minúsculas, números e hífens.` });
    if (ids.has(sponsor.id)) issues.push({ severity: 'error', message: `${ref}: id repetido.` });
    ids.add(sponsor.id);
    if (!sponsor.name.trim()) issues.push({ severity: 'error', message: `${ref}: nome vazio.` });
    if (!Number.isFinite(sponsor.displayOrder)) issues.push({ severity: 'error', message: `${ref}: displayOrder inválido.` });
    if (sponsor.logo !== null && (!sponsor.logo.trim() || /\s/.test(sponsor.logo))) {
      issues.push({ severity: 'warning', message: `${ref}: caminho da logo vazio ou com espaços.` });
    }
    for (const link of sponsor.socialLinks) {
      if (!isHttpsUrl(link.url)) issues.push({ severity: 'warning', message: `${ref}: link "${link.label}" precisa usar https:// e foi ocultado.` });
    }
    for (const contact of sponsor.contactLinks) {
      if (contact.type === 'link' && !isHttpsUrl(contact.url)) {
        issues.push({ severity: 'warning', message: `${ref}: contato "${contact.label}" precisa usar https:// e foi ocultado.` });
      }
      if (contact.type === 'whatsapp') {
        const link = buildWhatsAppUrl(contact.phone, contact.message);
        if (!contact.confirmed) issues.push({ severity: 'warning', message: `${ref}: WhatsApp aguardando confirmação do número; botão oculto.` });
        else if (!link.ok) issues.push({ severity: 'error', message: `${ref}: WhatsApp inválido (${link.reason}); botão oculto.` });
      }
    }
  }
  return issues;
}
