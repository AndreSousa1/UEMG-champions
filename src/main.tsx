import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import './styles/index.css';
import { App } from './App';
import { tournamentConfig } from './config/tournament.config';
import { matches } from './data/matches';
import { sponsors } from './data/sponsors';
import { liveStreams } from './data/streams';
import { teams } from './data/teams';
import { buildTournament } from './lib/tournament';

const model = buildTournament(tournamentConfig, teams, matches, sponsors, liveStreams);

document.documentElement.style.setProperty('--brand-accent', model.config.theme.accent);
document.documentElement.style.setProperty('--brand-accent-contrast', model.config.theme.accentContrast);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App model={model} />
  </StrictMode>,
);
