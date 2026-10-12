# UEMG champions — site do campeonato

Site público do campeonato universitário de Counter-Strike **UEMG champions** (12 a 15 de outubro de 2026, 12 equipes, eliminação simples, 11 partidas).

Feito com React + TypeScript (strict) + Vite + Tailwind CSS. Não há backend: todas as informações ficam em três arquivos de dados e o site calcula sozinho horários, chaveamento, situação das equipes e a fase atual.

> **Importante:** tudo o que estiver em `src/config/` e `src/data/` vai para o JavaScript público do site. As opções de exibição (`publicDisplay`, `displaySettings`) só escondem itens da interface — **não** protegem dados. Nunca coloque nesses arquivos CPF, matrícula, e-mail, WhatsApp, Discord privado, nome completo ou dados de inscrição.

---

## Sumário

1. [Rodar localmente](#1-rodar-localmente)
2. [Onde editar cada coisa](#2-onde-editar-cada-coisa)
3. [Trocar o logo](#3-trocar-o-logo)
4. [Renomear uma equipe](#4-renomear-uma-equipe)
5. [Editar nicknames e elenco](#5-editar-nicknames-e-elenco)
6. [Importar equipes de uma planilha (CSV/JSON sanitizado)](#6-importar-equipes-de-uma-planilha-csvjson-sanitizado)
7. [Alterar datas e horários](#7-alterar-datas-e-horários)
8. [Alterar a duração das partidas](#8-alterar-a-duração-das-partidas)
9. [Registrar resultados](#9-registrar-resultados)
10. [Alterar o chaveamento](#10-alterar-o-chaveamento)
11. [Configurar links públicos](#11-configurar-links-públicos)
12. [Transmissões ao vivo](#12-transmissões-ao-vivo)
13. [Patrocinadores](#13-patrocinadores)
14. [Fase atual e simulação de data](#14-fase-atual-e-simulação-de-data)
15. [Gerar a versão de produção](#15-gerar-a-versão-de-produção)
16. [Testes e verificações](#16-testes-e-verificações)
17. [Estrutura de pastas](#17-estrutura-de-pastas)

---

## 1. Rodar localmente

Requisitos: **Node.js 22.18 ou superior** (o script de importação usa a execução nativa de TypeScript do Node).

```bash
npm install
npm run dev
```

Abra o endereço mostrado no terminal (normalmente http://localhost:5173). As alterações nos arquivos aparecem na hora.

## 2. Onde editar cada coisa

| O que mudar | Arquivo |
| --- | --- |
| Nome, datas, horário de início, durações, fuso, logo, links oficiais, rodapé, cor de destaque | `src/config/tournament.config.ts` |
| Nomes, siglas, logos, jogadores e links das equipes | `src/data/teams.ts` |
| Confrontos, dias, ordem, horários fixos e **resultados** | `src/data/matches.ts` |
| Links das transmissões ao vivo (um por dia) | `src/data/streams.ts` |
| Imagem do logo do campeonato | `public/assets/uemg-champions-logo.png` |
| Patrocinadores (textos, serviços, links, ordem, destaque) | `src/data/sponsors.ts` |
| Logos dos patrocinadores | `public/assets/patrocinadores/` |

Os componentes visuais não têm nenhum confronto, data ou nome fixo no código: tudo vem desses arquivos. Se algo estiver inconsistente (ex.: equipe repetida, resultado impossível), o TypeScript acusa o erro ou o site mostra um aviso "Dados do campeonato em revisão" no topo, em vez de exibir informação errada.

## 3. Trocar o logo

1. Salve o logo oficial como **`public/assets/uemg-champions-logo.png`** (PNG com fundo transparente fica melhor).
2. Pronto: o logo aparece no cabeçalho, no topo da página e no rodapé. Enquanto o arquivo não existir, o site mostra o nome "UEMG champions" em texto.

Para ajustar, edite `logo` em `src/config/tournament.config.ts`:

```ts
logo: {
  src: 'assets/uemg-champions-logo.png', // caminho dentro de public/
  alt: 'Logo do UEMG champions',
  headerHeight: 36,   // altura no cabeçalho (px)
  footerHeight: 56,   // altura no rodapé (px)
  heroHeight: 150,    // altura máxima no topo da página (px)
  showNameNextToLogoInHeader: true, // mostra o nome em texto ao lado do logo no cabeçalho
},
```

Para usar outro formato (SVG, WebP), basta mudar `src`.

## 4. Renomear uma equipe

Em `src/data/teams.ts`, cada equipe tem um **ID fixo de vaga** (`A` a `L`). O chaveamento usa o ID, então renomear não quebra nada:

```ts
{
  id: 'A',                 // NÃO altere: é a vaga no chaveamento
  name: 'Nome Oficial da Equipe',
  shortName: 'NOE',        // sigla curta, usada em espaços pequenos
  logo: 'assets/equipes/noe.png', // opcional: arquivo em public/ ou null
  isPlaceholder: false,    // remova ou use false quando os dados forem oficiais
  players: [],
  reserve: null,
  publicLinks: [],
  displaySettings: {},
},
```

Enquanto `isPlaceholder` for `true`, a ficha da equipe mostra o aviso "Nome provisório".

## 5. Editar nicknames e elenco

Publique **apenas nicknames** (e somente com autorização dos jogadores):

```ts
players: [
  { nickname: 'jogador1' },
  { nickname: 'jogador2' },
  { nickname: 'jogador3' },
  { nickname: 'jogador4' },
  { nickname: 'jogador5' },
],
reserve: { nickname: 'reserva1' }, // ou null
```

Opções de exibição:

- **Para todas as equipes**, em `tournament.config.ts > publicDisplay`: `showPlayers`, `showReserve`, `showTeamLinks`, `showCompetitiveLevel` (nível competitivo, desligado por padrão), `showMatchIds`.
- **Por equipe**, em `displaySettings`: `{ showPlayers: false }`, `{ showReserve: false }`, `{ showLinks: false }`, `{ showLevel: true }`.

Lembre: isso só esconde da tela. Se um dado não pode ser público, ele **não deve estar no arquivo**.

O campo opcional `level` de cada jogador só aparece se `showCompetitiveLevel` e `displaySettings.showLevel` estiverem ambos ligados.

## 6. Importar equipes de uma planilha (CSV/JSON sanitizado)

O link da planilha de inscrições **não foi fornecido e não foi acessado**. O site **não** se conecta ao Google Sheets e não carrega a planilha no navegador. Em vez disso há um importador local, que roda no seu computador e gera `src/data/teams.ts`.

### Como preparar o arquivo

Crie uma cópia **sanitizada** da planilha (ex.: uma nova aba ou arquivo) contendo **somente** estas colunas:

| Coluna | Obrigatória | Conteúdo |
| --- | --- | --- |
| `equipe_id` | sim | Vaga no chaveamento: `A` a `L` (definida pela organização — a ordem das linhas **não** define a vaga) |
| `equipe_nome` | sim | Nome público da equipe |
| `equipe_sigla` | não | Sigla curta |
| `nickname` | sim | Nickname do jogador |
| `funcao` | não | `titular` (padrão) ou `reserva` |
| `ordem` | não | Ordem de exibição do titular |
| `publicar` | sim | `sim` ou `não` — se o jogador autorizou a publicação do nickname |

Veja o exemplo fictício em `samples/equipes-exemplo.csv`. CSV com `,` ou `;` e JSON (lista de objetos com as mesmas colunas) são aceitos.

### Como rodar

```bash
# 1. Conferir (não altera nada, só mostra a prévia e os erros)
npm run import:teams -- caminho/equipes.csv

# 2. Gravar em src/data/teams.ts (uma cópia do arquivo anterior fica em src/data/teams.ts.bak)
npm run import:teams -- caminho/equipes.csv --escrever
```

Também aceita a URL de um CSV publicado, desde que ele contenha **apenas** as colunas acima.

### Proteções

- Colunas fora da lista (ex.: `cpf`, `email`, `whatsapp`, `matricula`, `nome_completo`, `discord`) fazem a importação **ser recusada** — nada é gravado.
- Valores com aparência de CPF, e-mail ou telefone também são recusados.
- Jogadores com `publicar = não` são omitidos.
- Erros claros para vaga inválida, nome diferente na mesma equipe, nickname duplicado, mais de 5 titulares ou mais de 1 reserva.
- Logos e links já configurados em `teams.ts` são preservados.
- O padrão do `.gitignore` bloqueia arquivos `inscricoes-completas*.csv/json` para evitar que a planilha completa vá para o repositório por engano.

Depois de importar, revise `src/data/teams.ts` e rode `npm run check`.

## 7. Alterar datas e horários

Tudo fica em `src/config/tournament.config.ts > schedule`:

```ts
schedule: {
  timeZone: 'America/Sao_Paulo',
  timeZoneLabel: 'Horário de Brasília',
  days: [
    { date: '2026-10-12', startTime: '19:00' },
    { date: '2026-10-13', startTime: '19:00' },
    { date: '2026-10-14', startTime: '19:00' },
    { date: '2026-10-15', startTime: '19:00' },
  ],
  durationsMinutes: { MD1: 60, MD3: 90 },
  gapMinutes: 0, // intervalo entre partidas
},
```

O horário de cada partida é calculado em sequência: a 1ª começa em `startTime`, a seguinte começa quando a anterior termina (duração + intervalo). Com os valores atuais:

| Dia | Partidas | Horários |
| --- | --- | --- |
| 12/10 | PRE-01 a PRE-04 (MD1) | 19:00, 20:00, 21:00, 22:00 |
| 13/10 | QF-01 a QF-04 (MD1) | 19:00, 20:00, 21:00, 22:00 |
| 14/10 | SF-01, SF-02 (MD3) | 19:00, 20:30 |
| 15/10 | FINAL (MD3) | 19:00 |

- **Mudar o dia de uma partida:** altere `date` em `src/data/matches.ts` (o dia precisa existir em `schedule.days`).
- **Mudar a ordem no dia:** altere `order`.
- **Fixar um horário específico:** adicione `fixedTime: '20:15'` na partida. As partidas seguintes do mesmo dia passam a ser calculadas a partir dela.

Os horários são exibidos no formato brasileiro (dd/mm, 24 h) e sempre como "previstos", já que dependem da duração real das partidas.

## 8. Alterar a duração das partidas

Em `schedule.durationsMinutes` (`MD1` e `MD3`) e `schedule.gapMinutes`. Todos os horários, a contagem regressiva e o calendário se ajustam automaticamente. O site avisa se houver sobreposição de horários ou se uma partida estiver marcada antes da partida da qual depende.

## 9. Registrar resultados

Em `src/data/matches.ts`, altere `status` e `maps` da partida. `rounds` é sempre `[equipe 1, equipe 2]`, na ordem `team1`/`team2` da partida.

**Partida ao vivo:**

```ts
{ id: 'PRE-01', ..., status: 'live', maps: [] },
```

**MD1 encerrada (exatamente 1 mapa):**

```ts
{ id: 'PRE-01', ..., status: 'completed', maps: [{ map: 'Mirage', rounds: [13, 9] }] },
```

**MD3 em andamento (placar parcial):**

```ts
{ id: 'SF-01', ..., status: 'live', maps: [{ map: 'Inferno', rounds: [13, 11] }] },
```

**MD3 encerrada (uma equipe com 2 mapas):**

```ts
{ id: 'SF-01', ..., status: 'completed', maps: [
  { map: 'Inferno', rounds: [13, 11] },
  { map: 'Nuke', rounds: [8, 13] },
  { map: 'Ancient', rounds: [16, 14] },
] },
```

**Vitória por W.O.:**

```ts
{ id: 'QF-03', ..., status: 'completed', walkover: 1, maps: [] }, // 1 = equipe 1 vence
```

**Partida adiada:** `status: 'postponed'` (opcional: `note: 'Remarcada pela organização'`).

Se não souber o placar de rounds de um mapa, use `{ map: 'Mirage', winner: 1 }`.

Regras aplicadas automaticamente:

- O vencedor **só avança** quando `status` é `'completed'` **e** o resultado é válido.
- MD1 precisa de exatamente um mapa decidido; MD3 termina quando uma equipe vence 2 mapas.
- Empates, mapas a mais, placares incompatíveis ou partidas "encerradas" sem vencedor não avançam ninguém e aparecem no aviso de inconsistência.
- Situação das equipes (Aguardando estreia, Classificada, Semifinalista, Finalista, Campeã, Eliminada), estatísticas, próxima partida e a seção de campeão são calculadas a partir dos resultados — nada precisa ser preenchido à mão.

## 10. Alterar o chaveamento

Os confrontos ficam em `src/data/matches.ts`. Cada lado da partida é uma equipe fixa (`{ team: 'A' }`) ou o vencedor de outra partida (`{ winnerOf: 'PRE-01' }`). O TypeScript recusa IDs de equipe, partidas ou datas que não existem.

### Estrutura atual (definida pela organização)

| Partida | Confronto | Dia | Formato |
| --- | --- | --- | --- |
| PRE-01 | Equipe A × Equipe B | 12/10 | MD1 |
| PRE-02 | Equipe C × Equipe D | 12/10 | MD1 |
| PRE-03 | Equipe E × Equipe F | 12/10 | MD1 |
| PRE-04 | Equipe G × Equipe H | 12/10 | MD1 |
| QF-01 | Vencedor PRE-01 × Vencedor PRE-02 | 13/10 | MD1 |
| QF-02 | Vencedor PRE-03 × Vencedor PRE-04 | 13/10 | MD1 |
| QF-03 | Equipe I × Equipe J | 13/10 | MD1 |
| QF-04 | Equipe K × Equipe L | 13/10 | MD1 |
| SF-01 | Vencedor QF-01 × Vencedor QF-03 | 14/10 | MD3 |
| SF-02 | Vencedor QF-02 × Vencedor QF-04 | 14/10 | MD3 |
| FINAL | Vencedor SF-01 × Vencedor SF-02 | 15/10 | MD3 |

### Atenção: caminhos assimétricos

Nesta estrutura, as equipes A–H precisam vencer **4 partidas** para ser campeãs (preliminar, quartas, semi e final), enquanto as equipes I–L precisam de apenas **3** (estreiam nas quartas). Além disso, duas equipes vindas da fase preliminar se enfrentam entre si nas quartas (QF-01 e QF-02). Isso não é um erro do site: é a estrutura informada pela organização, mantida exatamente como foi definida.

### Alternativa equilibrada (não aplicada)

Uma opção mais comum para 12 equipes é cada vencedor da fase preliminar enfrentar uma equipe que estreia nas quartas:

| Partida | Confronto |
| --- | --- |
| QF-01 | Vencedor PRE-01 × Equipe I |
| QF-02 | Vencedor PRE-02 × Equipe J |
| QF-03 | Vencedor PRE-03 × Equipe K |
| QF-04 | Vencedor PRE-04 × Equipe L |

com semifinais `SF-01: QF-01 × QF-02` e `SF-02: QF-03 × QF-04`. Para usá-la, troque `team1`/`team2` das quartas e semifinais em `matches.ts`. **Use apenas uma das estruturas** — misturar as duas faz uma equipe aparecer em dois jogos, e o site acusa a inconsistência.

### Nomes das fases

Os nomes e descrições ficam em `tournament.config.ts > stages`. A primeira fase se chama "Fase preliminar" (não "Oitavas", pois não são 16 equipes).

## 11. Configurar links públicos

Nenhum link foi inventado — as listas começam vazias e os botões só aparecem quando há links configurados.

**Links oficiais do campeonato** (`tournament.config.ts`):

```ts
officialLinks: [
  { label: 'Instagram oficial', url: 'https://instagram.com/...', kind: 'social' },
  { label: 'Transmissão', url: 'https://twitch.tv/...', kind: 'stream' },
],
organization: {
  name: 'Nome da organização',
  description: 'Texto curto exibido no rodapé.',
},
```

**Links de uma equipe** (`teams.ts`), exibidos se `publicDisplay.showTeamLinks` estiver ligado:

```ts
publicLinks: [{ label: 'Instagram', url: 'https://instagram.com/...', kind: 'social' }],
```

`kind` pode ser `'site'`, `'social'`, `'stream'` ou `'other'`. Apenas URLs `https://` ou `http://` são aceitas; outras (ex.: `javascript:`) geram aviso de inconsistência e não são exibidas.

## 12. Transmissões ao vivo

Os links das lives ficam em **`src/data/streams.ts`**, um por dia. O botão **Acompanhe a live** aparece no card da próxima partida (topo da página) e nos detalhes de cada jogo, usando o link do dia da partida.

```ts
byDay: {
  '2026-10-12': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
  '2026-10-13': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA', // troque quando a live do dia estiver no ar
  '2026-10-14': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
  '2026-10-15': 'https://www.youtube.com/watch?v=Cxy2-GkWYqA',
},
```

Para uma partida em outro canal, use `byMatch: { FINAL: 'https://...' }` — esse valor substitui o do dia. Deixe a string vazia para esconder o botão naquele dia.

## 13. Patrocinadores

Os patrocinadores ficam em **`src/data/sponsors.ts`** e as logos em **`public/assets/patrocinadores/`**. A partir dessa lista o site monta automaticamente:

- a seção "Patrocinador oficial" / "Patrocinadores oficiais", antes do rodapé;
- o nome dos patrocinadores sendo escrito em loop no topo da página (estático para quem ativou "reduzir movimento");
- o item "Patrocinadores" no menu e a menção no rodapé.

Nada disso aparece quando não há patrocinador ativo.

### Adicionar um patrocinador

1. Salve a logo em `public/assets/patrocinadores/` com um nome sem espaços e em minúsculas (ex.: `loja-exemplo.png`).
2. Copie o bloco da N1 Skins em `sponsors.ts` e ajuste os campos:

```ts
{
  id: 'loja-exemplo',                     // único, minúsculas e hífens
  name: 'Loja Exemplo',
  logo: 'assets/patrocinadores/loja-exemplo.png', // ou null (mostra o nome)
  category: 'Periféricos',
  description: 'Descrição institucional curta.',
  about: 'Parágrafo complementar opcional.', // opcional
  services: [{ id: 'venda', title: 'Venda', description: 'Texto curto.', icon: 'sell' }],
  paymentMethods: [{ id: 'pix', label: 'PIX', kind: 'pix' }],
  socialLinks: [{ id: 'instagram', network: 'instagram', label: 'Visitar Instagram', url: 'https://www.instagram.com/...', handle: '@perfil' }],
  contactLinks: [],
  isActive: true,
  displayOrder: 2,   // ordem de exibição
  featured: false,   // true = cartão grande em largura total
  displaySettings: { logoBackground: '#000000' }, // cor atrás da logo (opcional)
},
```

- **Ordem:** `displayOrder` (menor primeiro).
- **Destaque:** `featured: true` gera o cartão grande; os demais aparecem em cartões menores, centralizados, em até 3 colunas. Com um único patrocinador, ele sempre usa o cartão grande.
- **Ocultar sem apagar:** `isActive: false`.
- **Campos opcionais:** listas vazias (`services`, `paymentMethods`, `socialLinks`, `contactLinks`) simplesmente não aparecem; sem `logo`, o cartão mostra o nome da marca.
- **Ícones disponíveis:** serviços `'buy' | 'trade' | 'sell' | 'delivery' | 'support' | 'generic'`; pagamentos `'pix' | 'crypto' | 'card' | 'cash' | 'other'`; redes `'instagram' | 'site' | 'youtube' | 'twitch' | 'x' | 'tiktok' | 'other'`.
- `displaySettings` também aceita `logoAlt`, `logoPadding`, `showDescription`, `showServices` e `showPaymentMethods`.
- Links precisam usar `https://`; os demais são ocultados.

### WhatsApp da N1 Skins (pendente)

O número recebido, `(37) 9867-4878`, tem 8 dígitos depois do DDD e começa com 9. Celulares brasileiros têm 9 dígitos depois do DDD, então parece faltar um dígito. Por isso o botão **"Fale pelo WhatsApp" está oculto**. Quando a organização confirmar o número completo, edite o contato em `sponsors.ts`:

```ts
phone: '(37) 9XXXX-XXXX', // número completo confirmado
confirmed: true,
```

O link `https://wa.me/55…` é gerado automaticamente, removendo a formatação, acrescentando o código do Brasil (55) e codificando a mensagem inicial (`message`). Mesmo com `confirmed: true`, números incompletos continuam sem botão.

## 14. Fase atual e simulação de data

A fase exibida (Não iniciado / Em andamento / Concluído) é calculada pela data atual e pelos resultados. Em `tournament.config.ts`:

- `phaseOverride: 'not-started' | 'in-progress' | 'completed' | null` — força a fase exibida (use `null` para o cálculo automático).
- `clockOverride: '2026-10-13T20:30:00-03:00' | null` — simula o relógio do site para conferir como ele ficará num dado momento. **Volte para `null` antes de publicar.**

## 15. Gerar a versão de produção

```bash
npm run build     # gera a pasta dist/
npm run preview   # serve dist/ localmente para conferência
```

A pasta `dist/` é estática e pode ser publicada em qualquer hospedagem de arquivos (GitHub Pages, Netlify, Vercel, servidor da universidade etc.). Os caminhos são relativos, então funciona também em subpastas.

## 16. Testes e verificações

```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # testes automatizados (Vitest)
npm run check      # tudo acima + build
```

Os testes cobrem: 12 equipes e 11 partidas; nenhuma equipe em dois jogos da mesma rodada; confrontos exatos da estrutura; avanço automático dos vencedores; regras MD1/MD3; partidas não encerradas não avançam ninguém; resultados inválidos; horários calculados (19/20/21/22, 19:00 e 20:30, 19:00); horário fixo; fuso de Brasília; situação das equipes; campeão só após a final; patrocinadores (exibição, logo, links, ordem, inativos, vários cartões, campos ausentes, seção oculta sem patrocinadores e bloqueio de WhatsApp incompleto); e ausência de CPF, e-mail, telefone e campos sensíveis nos dados públicos e no HTML gerado.

## 17. Estrutura de pastas

```
public/
  assets/                       ← coloque aqui uemg-champions-logo.png
samples/equipes-exemplo.csv     ← exemplo FICTÍCIO para o importador
scripts/import-teams.ts         ← importador local de CSV/JSON sanitizado
src/
  config/tournament.config.ts   ← configuração geral e agenda
  data/teams.ts                 ← equipes
  data/matches.ts               ← partidas e resultados
  data/streams.ts               ← links das transmissões ao vivo
  data/sponsors.ts              ← patrocinadores
  types/tournament.ts, sponsor.ts ← tipos
  lib/
    bracket.ts                  ← resolução do chaveamento e validação estrutural
    schedule.ts                 ← cálculo de horários
    tournament-status.ts        ← fase, situação das equipes, próxima partida, estatísticas
    results.ts                  ← regras MD1/MD3/W.O.
    validation.ts, privacy.ts   ← validação de dados e bloqueio de dados sensíveis
    team-import.ts              ← lógica do importador
    sponsors.ts                 ← ordem, filtro de ativos e validação do WhatsApp
    ...
  components/                   ← interface (cabeçalho, chaveamento, partidas, equipes etc.)
  tests/                        ← testes automatizados
```

---

### Pendências que dependem da organização

- Arquivo do logo oficial.
- Nomes, siglas, logos e (com autorização) nicknames das 12 equipes, e a definição de qual equipe ocupa cada vaga A–L.
- Nome/descrição da organização para o rodapé e links oficiais (redes sociais, transmissão).
- Confirmação da estrutura das quartas (atual, assimétrica) ou adoção da alternativa equilibrada.
- Lista de mapas, se quiser exibi-los nos resultados.
- Número completo do WhatsApp da N1 Skins (o recebido parece estar sem o nono dígito).
