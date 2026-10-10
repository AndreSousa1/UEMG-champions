import type { Sponsor } from '../types/sponsor';

/**
 * PATROCINADORES
 *
 * Para adicionar um patrocinador, copie um bloco e ajuste os campos. A seção,
 * o letreiro do topo e o rodapé são gerados automaticamente a partir desta lista.
 *
 * - `id`: identificador único e estável, sem espaços (ex.: 'loja-exemplo').
 * - `logo`: arquivo dentro de public/ (ex.: 'assets/patrocinadores/loja.png') ou null.
 *           Prefira nomes sem espaços e em minúsculas.
 * - `isActive`: false esconde o patrocinador do site.
 * - `displayOrder`: ordem de exibição (1, 2, 3...).
 * - `featured`: true exibe o cartão de destaque em largura total.
 * - `services[].icon`: 'buy' | 'trade' | 'sell' | 'delivery' | 'support' | 'generic'.
 * - `paymentMethods[].kind`: 'pix' | 'crypto' | 'card' | 'cash' | 'other'.
 * - `socialLinks[].network`: 'instagram' | 'site' | 'youtube' | 'twitch' | 'x' | 'tiktok' | 'other'.
 * - `contactLinks`: { type: 'whatsapp', phone, confirmed, message? } ou { type: 'link', url }.
 *     O botão de WhatsApp só aparece com `confirmed: true` e número completo
 *     (DDD + 9 dígitos para celular).
 *
 * Tudo neste arquivo é público. Inclua apenas informações comerciais
 * fornecidas pela organização/patrocinador.
 */
export const sponsors = [
  {
    id: 'n1-skins',
    name: 'N1 Skins',
    logo: 'assets/patrocinadores/n1-skins-logo.jpeg',
    category: 'Skins de Counter-Strike 2',
    description:
      'Sua loja oficial de skins de CS2. Compre, venda, encomende e faça o upgrade do seu inventário de forma rápida e 100% segura pelo Instagram e WhatsApp[cite: 1].',
    about:
      'Líder em transparência e segurança no CS2: acompanhe gameplays reais das skins, feedbacks de clientes satisfeitos e nossa presença nos maiores eventos do cenário, como a IEM Rio[cite: 1].',
    services: [
      {
        id: 'compra',
        title: 'Venda suas Skins e receba na hora',
        description: 'Transforme suas skins do CS2 em dinheiro sem enrolação! Pagamento instantâneo via PIX ou Criptomoedas[cite: 1].',
        icon: 'buy',
      },
      {
        id: 'upgrade',
        title: 'Upgrade & Troca de Inventário',
        description: 'Não jogue "Eco" de skin! Entregue seus itens atuais como parte do pagamento para pegar uma skin ainda melhor[cite: 1].',
        icon: 'trade',
      },
      {
        id: 'venda',
        title: 'Venda & Encomendas Exclusivas',
        description: 'Achamos qualquer skin do CS2 para você com entrega direta na sua conta Steam e suporte personalizado[cite: 1].',
        icon: 'sell',
      },
    ],
    paymentMethods: [
      { id: 'pix', label: 'PIX Instantâneo', kind: 'pix' },
      { id: 'cripto', label: 'Criptomoedas', kind: 'crypto' },
    ],
    socialLinks: [
      {
        id: 'instagram',
        network: 'instagram',
        label: 'Siga a @n1skins no Instagram',
        url: 'https://www.instagram.com/n1skins?obrf=dXhoaXV1cnNrYnc0',
        handle: '@n1skins',
      },
    ],
    contactLinks: [
      {
        id: 'whatsapp',
        type: 'whatsapp',
        label: 'Chame no WhatsApp e faça sua cotação',
        // Número recebido com 8 dígitos após o DDD — parece faltar o 9 inicial
        // de celular. Confirme o número completo antes de marcar `confirmed: true`.
        phone: '(37) 9867-4878',
        confirmed: false,
        message: 'Olá! Vim pelo UEMG Champions e quero fazer uma cotação de skins com a N1 Skins!',
      },
    ],
    isActive: true,
    displayOrder: 1,
    featured: true,
    displaySettings: {
      logoAlt: 'Logo da N1 Skins',
      logoBackground: '#020200',
    },
  },
] as const satisfies readonly Sponsor[];