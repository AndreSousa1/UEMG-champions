import {
  AtSign,
  Banknote,
  Coins,
  CreditCard,
  Globe,
  HandCoins,
  Link2,
  MessageCircle,
  Music2,
  PackageCheck,
  Play,
  QrCode,
  Radio,
  Repeat2,
  Sparkles,
  Truck,
  Wallet,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { PaymentMethodKind, SocialNetwork, SponsorServiceIcon } from '../../types/sponsor';
import { InstagramIcon } from '../ui/InstagramIcon';

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export const SERVICE_ICONS: Record<SponsorServiceIcon, Icon> = {
  buy: HandCoins,
  trade: Repeat2,
  sell: PackageCheck,
  delivery: Truck,
  support: MessageCircle,
  generic: Sparkles,
};

export const PAYMENT_ICONS: Record<PaymentMethodKind, Icon> = {
  pix: QrCode,
  crypto: Coins,
  card: CreditCard,
  cash: Banknote,
  other: Wallet,
};

export const SOCIAL_ICONS: Record<SocialNetwork, Icon> = {
  instagram: InstagramIcon,
  site: Globe,
  youtube: Play,
  twitch: Radio,
  x: AtSign,
  tiktok: Music2,
  other: Link2,
};

export const CONTACT_ICONS: Record<'whatsapp' | 'link', Icon> = {
  whatsapp: MessageCircle,
  link: Link2,
};
