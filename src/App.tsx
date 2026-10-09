import { BracketSection } from './components/bracket/BracketSection';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { IssuesBanner } from './components/layout/IssuesBanner';
import { MatchDialog } from './components/matches/MatchDialog';
import { MatchesSection } from './components/matches/MatchesSection';
import { TeamDialog } from './components/teams/TeamDialog';
import { TeamsSection } from './components/teams/TeamsSection';
import { ChampionHighlight } from './components/tournament/ChampionHighlight';
import { FormatSection } from './components/tournament/FormatSection';
import { Hero } from './components/tournament/Hero';
import { StatsStrip } from './components/tournament/StatsStrip';
import type { TournamentModel } from './lib/tournament';
import { TournamentProvider } from './state/TournamentProvider';

interface AppProps {
  model: TournamentModel;
  fixedNow?: Date;
}

export function App({ model, fixedNow }: AppProps) {
  return (
    <TournamentProvider model={model} fixedNow={fixedNow}>
      <a
        href="#conteudo"
        className="sr-only z-[60] rounded-md bg-accent px-4 py-2 font-semibold text-accent-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo">
        <IssuesBanner />
        <Hero />
        <StatsStrip />
        <ChampionHighlight />
        <BracketSection />
        <MatchesSection />
        <TeamsSection />
        <FormatSection />
      </main>
      <Footer />
      <MatchDialog />
      <TeamDialog />
    </TournamentProvider>
  );
}
