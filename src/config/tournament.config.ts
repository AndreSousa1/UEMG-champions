import type { TournamentConfig } from '../types/tournament';

/**
 * CONFIGURAÇÃO CENTRAL DO UEMG champions
 *
 * Tudo o que a organização normalmente precisa ajustar sobre o evento está aqui.
 * Equipes, partidas, resultados e patrocinadores ficam em src/data/tournament.json.
 * Após salvar, o site (agenda, chaveamento, contagem regressiva e cartões) é
 * recalculado automaticamente.
 */
export const tournamentConfig = {
  /** Nome oficial do campeonato. */
  name: 'UEMG champions',
  /** Nome exibido na interface (pode ser igual ao oficial). */
  displayName: 'UEMG champions',
  /** Linha de apoio exibida abaixo do nome no topo da página. */
  tagline: 'Campeonato universitário de Counter-Strike',
  /** Modalidade. */
  game: 'Counter-Strike 2 / CS:GO',
  year: 2026,
  /** Descrição curta do formato. */
  formatLabel: 'Eliminação simples',

  /**
   * LOGO OFICIAL
   * Coloque o arquivo em public/assets/uemg-champions-logo.png (ou altere `src`).
   * Enquanto o arquivo não existir, o site exibe automaticamente o nome em texto.
   * As alturas são em pixels.
   */
  logo: {
    src: 'assets/uemg-champions-logo.png',
    alt: 'Logo do UEMG champions',
    headerHeight: 36,
    footerHeight: 56,
    heroHeight: 150,
    showNameNextToLogoInHeader: true,
  },

  /**
   * AGENDA
   * - days: cada dia do evento e o horário da primeira partida.
   * - durationsMinutes: duração ESTIMADA de cada formato.
   * - gapMinutes: intervalo entre partidas.
   * Os horários das partidas são calculados em sequência a partir destes valores,
   * na ordem definida pelo campo `order` em src/data/tournament.json. Uma partida com
   * `fixedTime` ignora o cálculo e passa a ser a referência para as seguintes.
   */
  schedule: {
    timeZone: 'America/Sao_Paulo',
    timeZoneLabel: 'Horário de Brasília',
    days: {
      '2026-10-12': { startTime: '19:00' },
      '2026-10-13': { startTime: '19:00' },
      '2026-10-14': { startTime: '19:00' },
      '2026-10-15': { startTime: '19:00' },
    },
    durationsMinutes: {
      MD1: 60,
      MD3: 90,
    },
    gapMinutes: 0,
  },

  /** Nomes das etapas exibidos na interface. */
  stages: {
    preliminary: {
      label: 'Fase preliminar',
      shortLabel: 'Preliminar',
      description: 'Confrontos eliminatórios em MD1 que definem quem avança às quartas de final.',
    },
    quarterfinal: {
      label: 'Quartas de final',
      shortLabel: 'Quartas',
      description: 'Oito equipes, quatro confrontos em MD1. Os vencedores vão às semifinais.',
    },
    semifinal: {
      label: 'Semifinais',
      shortLabel: 'Semis',
      description: 'Séries MD3: vence quem conquistar dois mapas primeiro.',
    },
    final: {
      label: 'Final',
      shortLabel: 'Final',
      description: 'Série MD3 que define a equipe campeã do UEMG champions.',
    },
  },

  /**
   * Situação do campeonato. null = automática (a partir dos resultados e da agenda).
   * Valores aceitos: 'not-started' | 'in-progress' | 'completed'.
   */
  phaseOverride: null,

  /**
   * Simula outra data/hora para conferir o site antes do evento,
   * ex.: '2026-10-13T20:30:00-03:00'. Mantenha null em produção.
   */
  clockOverride: null,

  /**
   * O que aparece publicamente. Desligar um item apenas o oculta da interface;
   * os dados continuam no código publicado. Nunca cadastre dados pessoais.
   */
  publicDisplay: {
    showPlayers: true,
    showReserve: true,
    showTeamLinks: true,
    showCompetitiveLevel: false,
    showMatchIds: true,
  },

  /**
   * Links oficiais do evento (redes sociais, transmissão, regulamento...).
   * Exemplo: { label: 'Instagram', url: 'https://instagram.com/perfil', kind: 'social' }
   */
  officialLinks: [],

  /** Informações da organização exibidas no rodapé. null = não exibir. */
  organization: {
    name: null,
    description: null,
  },

  /** Preferências visuais. `accent` é a cor de destaque principal. */
  theme: {
    accent: '#c6ff3a',
    accentContrast: '#0a0d12',
  },
} as const satisfies TournamentConfig;

/** Datas válidas para o campo `date` das partidas. */
export type ScheduleDate = keyof typeof tournamentConfig.schedule.days;
