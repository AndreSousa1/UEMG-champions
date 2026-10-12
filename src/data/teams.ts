import type { TeamDefinition } from '../types/tournament';

/**
 * EQUIPES DO UEMG champions
 *
 * - `id` identifica a vaga no chaveamento (A–L). Não altere: as partidas usam esse valor.
 * - `name` / `shortName`: nomes oficiais e versões curtas para exibição.
 * - `logo`: caminho dentro de public/, ex.: 'assets/teams/equipe-a.png', ou null.
 * - `players`: nicknames dos jogadores, na ordem informada na inscrição.
 * - `reserve`: nickname do reserva inscrito ou null.
 * - `publicLinks`: links públicos autorizados; nenhum foi informado no CSV.
 * - `displaySettings`: controles opcionais de exibição por equipe.
 * - `isPlaceholder`: false indica que a vaga foi associada a uma inscrição real.
 *
 * PRIVACIDADE: este arquivo contém apenas nome da equipe e nicknames.
 * Não inclua CPF, matrícula, e-mail, telefone, nome completo, Steam ID ou qualquer
 * outro dado administrativo neste arquivo, pois seu conteúdo será público no frontend.
 *
 * Mapeamento A–L atribuído na ordem das linhas do CSV recebido. Se a organização
 * definir outra ordem oficial para o chaveamento, altere somente os IDs conforme
 * necessário e mantenha as referências das partidas consistentes.
 */
export const teams = [
  {
    id: 'E',
    name: 'PND Gaming',
    shortName: 'PND',
    logo: 'assets/teams/PND Gaming.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'RoxtinN' }, { nickname: 'carlin;' }, { nickname: 'Gralha' }, { nickname: 'Hutch' }, { nickname: 'Remiquis' }],
    reserve: { nickname: 'Leoneashy' },
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'H',
    name: 'Banda',
    shortName: 'Banda',
    logo: 'assets/teams/Banda.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Xsq.' }, { nickname: 'Jaum' }, { nickname: 'ᴢғɪʀᴇ' }, { nickname: 'dring0d' }, { nickname: 'Mad' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'A',
    name: 'CMP E-sports',
    shortName: 'CMP',
    logo: 'assets/teams/CMP E-sports.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'CMP | savinxtz' }, { nickname: 'TiniN' }, { nickname: 'jxoz1n' }, { nickname: 'Smolkqz' }, { nickname: 'pipelinesx' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'G',
    name: 'Maned Wolf',
    shortName: 'Maned Wolf',
    logo: 'assets/teams/Maned Wolf.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'FeS' }, { nickname: 'K Y O M U' }, { nickname: 'IcR' }, { nickname: 'ViicTin' }, { nickname: 'Mudestel' }],
    reserve: { nickname: 'guto_04' },
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'C',
    name: 'Matilha FC',
    shortName: 'Matilha',
    logo: 'assets/teams/Matilha FC.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Down' }, { nickname: 'MATH FGC' }, { nickname: 'mecrrrrrrrajada' }, { nickname: 'Souza' }, { nickname: 'RUSSIN YAGAMA' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'K',
    name: 'VaiQueEuBango',
    shortName: 'VQEB',
    logo: 'assets/teams/VaiQueEuBango.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'FraNGo' }, { nickname: 'PedroPiranha' }, { nickname: 'oFerJão' }, { nickname: 'bRn?' }, { nickname: 'Genie Flick' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'D',
    name: 'Esquema de Aposta',
    shortName: 'Esquema',
    logo: 'assets/teams/Esquema de Aposta.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Tigrinho tá pagando' }, { nickname: 'voicezito' }, { nickname: 'Peter Wet' }, { nickname: 'pedra que esmagou o obito' }, { nickname: 'Dig' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'F',
    name: 'FNW',
    shortName: 'FNW',
    logo: 'assets/teams/FNW.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Cleyder' }, { nickname: 'Ollebac' }, { nickname: 'Godoi' }, { nickname: 'W' }, { nickname: 'Aranha' }],
    reserve: { nickname: 'LigeirinhoJESUS' },
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'I',
    name: 'PvTEAM',
    shortName: 'PvTEAM',
    logo: 'assets/teams/PvTEAM.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Gudereck' }, { nickname: 'hackshima' }, { nickname: 'Mcdk_' }, { nickname: 'caioba' }, { nickname: 'Joaozin de quebra' }],
    reserve: { nickname: 'Pedrãoo' },
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'B',
    name: 'Divine Forge',
    shortName: 'Divine',
    logo: 'assets/teams/Divine Forge.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'não aguento mais ser prata' }, { nickname: 'H4d.enCe' }, { nickname: 'Bartolomeu' }, { nickname: 'joaoasx11' }, { nickname: 'Kadlaki' }],
    reserve: null,
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'J',
    name: 'LimaMei',
    shortName: 'LimaMei',
    logo: 'assets/teams/LimaMei.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'Pedrofredyy' }, { nickname: 'Lootday' }, { nickname: 'Dao Ma' }, { nickname: 'DeCarD KaYn' }, { nickname: 'Less' }],
    reserve: { nickname: 'Lokiu' },
    publicLinks: [],
    displaySettings: {},
  },
  {
    id: 'L',
    name: 'Arsenal CS',
    shortName: 'Arsenal',
    logo: 'assets/teams/Arsenal CS.jpeg',
    isPlaceholder: false,
    players: [{ nickname: 'r0s' }, { nickname: 'V1TINHO' }, { nickname: 'ACR' }, { nickname: 'Dimitri' }, { nickname: 'Drt' }],
    reserve: { nickname: 'MCS' },
    publicLinks: [],
    displaySettings: {},
  },
] as const satisfies readonly TeamDefinition[];

export type TeamId = (typeof teams)[number]['id'];
