import { useEffect, useMemo, useState } from 'react';
import { AdminGate } from './components/admin/AdminGate';
import { BracketSection } from './components/bracket/BracketSection';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { IssuesBanner } from './components/layout/IssuesBanner';
import { MatchDialog } from './components/matches/MatchDialog';
import { MatchesSection } from './components/matches/MatchesSection';
import { SponsorsSection } from './components/sponsors/SponsorsSection';
import { TeamDialog } from './components/teams/TeamDialog';
import { TeamsSection } from './components/teams/TeamsSection';
import { ChampionHighlight } from './components/tournament/ChampionHighlight';
import { FormatSection } from './components/tournament/FormatSection';
import { Hero } from './components/tournament/Hero';
import { StatsStrip } from './components/tournament/StatsStrip';
import { tournamentConfig } from './config/tournament.config';
import { buildTournament, type TournamentModel } from './lib/tournament';
import { cloneData, clearTournamentData, loadTournamentData, saveTournamentData, sourceData, type TournamentData } from './lib/tournament-data';
import { TournamentProvider } from './state/TournamentProvider';

interface AppProps {
  model: TournamentModel;
  fixedNow?: Date;
  data?: TournamentData;
  onSave?: (next: TournamentData) => void;
  onReset?: () => void;
}

export function App({ model, fixedNow, data, onSave, onReset }: AppProps) {
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
        <SponsorsSection />
        <FormatSection />
      </main>
      <Footer />
      <MatchDialog />
      <TeamDialog />
      {data && onSave && onReset ? <AdminGate data={data} onSave={onSave} onReset={onReset} /> : null}
    </TournamentProvider>
  );
}

/** Entrada de produção: JSON + overlay local + painel Ctrl+Shift+L. */
export function LiveApp() {
  const [data, setData] = useState(() => loadTournamentData());
  const model = useMemo(
    () => buildTournament(tournamentConfig, data.teams, data.matches, data.sponsors, data.streams),
    [data],
  );

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-accent', model.config.theme.accent);
    document.documentElement.style.setProperty('--brand-accent-contrast', model.config.theme.accentContrast);
  }, [model]);

  return (
    <App
      model={model}
      data={data}
      onSave={(next) => {
        saveTournamentData(next);
        setData(cloneData(next));
      }}
      onReset={() => {
        clearTournamentData();
        setData(cloneData(sourceData));
      }}
    />
  );
}
