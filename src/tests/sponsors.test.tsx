import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { sponsors } from '../data/sponsors';
import { activeSponsors, buildWhatsAppUrl, resolveContact, validateSponsors } from '../lib/sponsors';
import type { Sponsor } from '../types/sponsor';
import { build } from './helpers';

const root = fileURLToPath(new URL('../..', import.meta.url));
const BEFORE_EVENT = new Date('2026-10-08T22:00:00-03:00');
const render = (list: readonly Sponsor[] = sponsors) => renderToString(<App model={build(undefined, undefined, list)} fixedNow={BEFORE_EVENT} />);

/** Patrocinador fictício mínimo; campos opcionais ausentes de propósito. */
function sponsor(patch: Partial<Sponsor> & Pick<Sponsor, 'id' | 'name'>): Sponsor {
  return {
    logo: null,
    category: 'Categoria de exemplo',
    description: 'Descrição fictícia.',
    services: [],
    paymentMethods: [],
    socialLinks: [],
    contactLinks: [],
    isActive: true,
    displayOrder: 10,
    featured: false,
    displaySettings: {},
    ...patch,
  };
}

const n1 = sponsors[0];

describe('patrocinadores — cadastro', () => {
  it('a N1 Skins está cadastrada, ativa e em destaque', () => {
    expect(n1.id).toBe('n1-skins');
    expect(n1.isActive).toBe(true);
    expect(n1.featured).toBe(true);
    expect(n1.services.map((s) => s.title)).toEqual(['Compra de skins', 'Upgrade e troca', 'Venda e encomendas']);
    expect(n1.paymentMethods.map((p) => p.label)).toEqual(['PIX', 'Criptomoedas']);
  });

  it('a logo aponta para um arquivo existente em public/, sem espaços no caminho', () => {
    expect(n1.logo).not.toBeNull();
    expect(n1.logo).not.toMatch(/\s/);
    expect(existsSync(join(root, 'public', n1.logo ?? ''))).toBe(true);
  });

  it('o cadastro só tem o aviso esperado do WhatsApp pendente', () => {
    expect(validateSponsors(sponsors)).toEqual([
      { severity: 'warning', message: 'Patrocinador "n1-skins": WhatsApp aguardando confirmação do número; botão oculto.' },
    ]);
  });

  it('acusa ids repetidos e links sem https', () => {
    const issues = validateSponsors([
      sponsor({ id: 'a', name: 'A', socialLinks: [{ id: 'x', network: 'site', label: 'Site', url: 'javascript:alert(1)' }] }),
      sponsor({ id: 'a', name: 'B' }),
    ]);
    expect(issues.some((i) => i.message.includes('id repetido'))).toBe(true);
    expect(issues.some((i) => i.message.includes('https://'))).toBe(true);
  });
});

describe('patrocinadores — WhatsApp', () => {
  it('não gera link para o número recebido, que está sem o nono dígito', () => {
    const contact = n1.contactLinks[0];
    expect(contact?.type).toBe('whatsapp');
    if (contact?.type !== 'whatsapp') return;
    const link = buildWhatsAppUrl(contact.phone);
    expect(link.ok).toBe(false);
    if (!link.ok) expect(link.reason).toContain('nono dígito');
    expect(resolveContact(contact)).toBeNull();
    expect(render()).not.toContain('wa.me');
  });

  it('não gera link sem confirmação, mesmo com número completo', () => {
    expect(resolveContact({ id: 'w', type: 'whatsapp', label: 'WhatsApp', phone: '(11) 91234-5678', confirmed: false })).toBeNull();
  });

  it('com número completo e confirmado, gera o link com DDI 55 e mensagem codificada', () => {
    const resolved = resolveContact({
      id: 'w',
      type: 'whatsapp',
      label: 'WhatsApp',
      phone: '+55 (11) 91234-5678',
      confirmed: true,
      message: 'Olá! Teste & ação?',
    });
    expect(resolved?.href).toBe('https://wa.me/5511912345678?text=Ol%C3%A1!%20Teste%20%26%20a%C3%A7%C3%A3o%3F');
  });

  it('recusa números incompletos, longos demais ou com DDD inválido', () => {
    for (const phone of ['9867-4878', '(11) 1234-567', '(11) 912345-67890', '(01) 91234-5678', '', 'abc']) {
      expect(buildWhatsAppUrl(phone).ok, phone).toBe(false);
    }
    expect(buildWhatsAppUrl('(11) 3456-7890').ok).toBe(true);
  });
});

describe('patrocinadores — exibição', () => {
  it('mostra a N1 Skins com logo, serviços, pagamentos e link do Instagram', () => {
    const html = render();
    expect(html).toContain('id="patrocinadores"');
    expect(html).toContain('Patrocinador oficial');
    expect(html).toContain('N1 Skins');
    expect(html).toContain('Skins de Counter-Strike 2');
    for (const text of ['Compra de skins', 'Upgrade e troca', 'Venda e encomendas', 'PIX', 'Criptomoedas', '@n1skins']) {
      expect(html).toContain(text);
    }
    expect(html).toMatch(/<img[^>]+src="[^"]*assets\/patrocinadores\/n1-skins-logo\.jpeg"[^>]+alt="Logo da N1 Skins"|<img[^>]+alt="Logo da N1 Skins"[^>]+src="[^"]*assets\/patrocinadores\/n1-skins-logo\.jpeg"/);
    expect(html).toContain('href="https://www.instagram.com/n1skins?obrf=dXhoaXV1cnNrYnc0" target="_blank" rel="noopener noreferrer"');
  });

  it('substitui o texto introdutório do topo pelo nome dos patrocinadores em loop', () => {
    const html = render();
    expect(html).not.toContain('dias de disputa');
    expect(html).toContain('aria-label="Patrocínio: N1 Skins. Ver patrocinadores"');
    expect(html).toContain('href="#patrocinadores"');
  });

  it('esconde inativos e respeita displayOrder', () => {
    const list = [
      sponsor({ id: 'terceiro', name: 'Marca Terceira', displayOrder: 3 }),
      sponsor({ id: 'inativo', name: 'Marca Inativa', displayOrder: 0, isActive: false }),
      sponsor({ id: 'primeiro', name: 'Marca Primeira', displayOrder: 1 }),
      sponsor({ id: 'segundo', name: 'Marca Segunda', displayOrder: 2 }),
    ];
    expect(activeSponsors(list).map((s) => s.id)).toEqual(['primeiro', 'segundo', 'terceiro']);

    const html = render(list);
    expect(html).not.toContain('Marca Inativa');
    const section = html.slice(html.indexOf('id="patrocinadores"'));
    const positions = ['Marca Primeira', 'Marca Segunda', 'Marca Terceira'].map((n) => section.indexOf(n));
    expect(positions.every((p) => p > 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  it('renderiza vários patrocinadores: destaque + cartões padrão, título no plural', () => {
    const html = render([...sponsors, sponsor({ id: 'outra', name: 'Outra Marca', displayOrder: 2 }), sponsor({ id: 'mais', name: 'Mais Uma', displayOrder: 3 })]);
    expect(html).toContain('Patrocinadores oficiais');
    expect(html).toContain('N1 Skins');
    expect(html).toContain('Outra Marca');
    expect(html).toContain('Mais Uma');
    expect(html.match(/<article/g)?.length).toBe(3);
    expect(html).toContain('aria-label="Patrocinadores: N1 Skins, Outra Marca, Mais Uma. Ver patrocinadores"');
  });

  it('campos opcionais ausentes não geram logo quebrada, listas ou botões vazios', () => {
    const html = render([sponsor({ id: 'minima', name: 'Marca Mínima' }), sponsor({ id: 'outra', name: 'Outra' })]);
    const section = html.slice(html.indexOf('id="patrocinadores"'), html.indexOf('<footer'));
    expect(section).toContain('Marca Mínima');
    expect(section).not.toContain('<img');
    expect(section).not.toContain('Formas de pagamento');
    expect(section).not.toContain('Serviços da');
    expect(section).not.toContain('target="_blank"');
    expect(section).not.toMatch(/href=""/);
  });

  it('sem patrocinadores ativos, a seção, o letreiro, o menu e o rodapé não mostram patrocínio', () => {
    const html = render([sponsor({ id: 'off', name: 'Desligada', isActive: false })]);
    expect(html).not.toContain('id="patrocinadores"');
    expect(html).not.toContain('#patrocinadores');
    expect(html).not.toContain('Desligada');
    expect(html).not.toContain('Patrocínio');
  });

  it('o restante do site continua sendo exibido', () => {
    const html = render();
    for (const id of ['inicio', 'chaveamento', 'partidas', 'equipes', 'formato']) expect(html).toContain(`id="${id}"`);
  });
});
