/** Ícone ilustrativo de um serviço (mapeado para a biblioteca de ícones do projeto). */
export type SponsorServiceIcon = 'buy' | 'trade' | 'sell' | 'delivery' | 'support' | 'generic';

export interface SponsorService {
  id: string;
  title: string;
  description: string;
  icon?: SponsorServiceIcon;
}

export type PaymentMethodKind = 'pix' | 'crypto' | 'card' | 'cash' | 'other';

export interface SponsorPaymentMethod {
  id: string;
  label: string;
  kind: PaymentMethodKind;
}

export type SocialNetwork = 'instagram' | 'site' | 'youtube' | 'twitch' | 'x' | 'tiktok' | 'other';

export interface SponsorSocialLink {
  id: string;
  network: SocialNetwork;
  /** Texto do botão, ex.: "Visitar Instagram". */
  label: string;
  /** Precisa começar com https://. */
  url: string;
  /** Exibido junto ao botão, ex.: "@n1skins". */
  handle?: string;
}

/**
 * Contato por WhatsApp. O link só é gerado quando `confirmed` é true E o número
 * tem o formato completo de um telefone brasileiro (DDD + número).
 */
export interface SponsorWhatsAppContact {
  id: string;
  type: 'whatsapp';
  label: string;
  /** Número comercial em um único campo; a formatação é removida automaticamente. */
  phone: string;
  /** Marque true somente depois de confirmar o número completo com a organização. */
  confirmed: boolean;
  /** Mensagem inicial opcional (codificada automaticamente no link). */
  message?: string;
}

export interface SponsorLinkContact {
  id: string;
  type: 'link';
  label: string;
  url: string;
}

export type SponsorContact = SponsorWhatsAppContact | SponsorLinkContact;

export interface SponsorDisplaySettings {
  /** Texto alternativo da logo; padrão: "Logo da {name}". */
  logoAlt?: string;
  /** Cor de fundo atrás da logo, para combinar com o fundo do arquivo original. */
  logoBackground?: string;
  /** Respiro interno da logo em px (padrão 0 para destaque, 16 para os demais). */
  logoPadding?: number;
  showDescription?: boolean;
  showServices?: boolean;
  showPaymentMethods?: boolean;
}

export interface Sponsor {
  /** Identificador único e estável (ex.: "n1-skins"). */
  id: string;
  name: string;
  /** Caminho dentro de public/ (ex.: "assets/patrocinadores/marca.png") ou null. */
  logo: string | null;
  category: string;
  description: string;
  /** Parágrafo complementar opcional, ex.: o que a marca publica em seus canais. */
  about?: string;
  services: readonly SponsorService[];
  paymentMethods: readonly SponsorPaymentMethod[];
  socialLinks: readonly SponsorSocialLink[];
  contactLinks: readonly SponsorContact[];
  /** false = não aparece no site. */
  isActive: boolean;
  /** Ordem crescente de exibição. */
  displayOrder: number;
  /** true = cartão de destaque em largura total. */
  featured: boolean;
  displaySettings: SponsorDisplaySettings;
}
