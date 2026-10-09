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
      'Loja especializada no mercado de negociação de itens e skins de Counter-Strike 2, com compra, venda, encomendas e opções de upgrade de itens. A divulgação e o atendimento são feitos principalmente pelo Instagram e pelo WhatsApp.',
    about:
      'No Instagram, a loja publica conteúdos sobre negociação segura (incluindo os destaques “Tradeprotected”), feedbacks de clientes, skins em jogo, ofertas de compra, venda e upgrade e referências à presença em eventos do cenário, como a IEM Rio.',
    services: [
      {
        id: 'compra',
        title: 'Compra de skins',
        description: 'Compra de skins dos jogadores, com pagamento rápido via PIX ou criptomoedas, conforme informado pela loja.',
        icon: 'buy',
      },
      {
        id: 'upgrade',
        title: 'Upgrade e troca',
        description: 'Use uma skin atual como parte do pagamento para obter um item de maior valor.',
        icon: 'trade',
      },
      {
        id: 'venda',
        title: 'Venda e encomendas',
        description: 'Venda e encomenda de skins de CS2, com entrega na conta Steam do comprador, conforme as condições da negociação.',
        icon: 'sell',
      },
    ],
    paymentMethods: [
      { id: 'pix', label: 'PIX', kind: 'pix' },
      { id: 'cripto', label: 'Criptomoedas', kind: 'crypto' },
    ],
    socialLinks: [
      {
        id: 'instagram',
        network: 'instagram',
        label: 'Conheça a N1 Skins',
        url: 'https://www.instagram.com/n1skins?obrf=dXhoaXV1cnNrYnc0',
        handle: '@n1skins',
      },
    ],
    contactLinks: [
      {
        id: 'whatsapp',
        type: 'whatsapp',
        label: 'Fale pelo WhatsApp',
        // Número recebido com 8 dígitos após o DDD — parece faltar o 9 inicial
        // de celular. Confirme o número completo antes de marcar `confirmed: true`.
        phone: '(37) 9867-4878',
        confirmed: false,
        message: 'Olá! Conheci a N1 Skins pelo campeonato UEMG champions e gostaria de obter mais informações.',
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
