import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/600.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/barlow-condensed/800.css';
import './styles/index.css';
import { LiveApp } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LiveApp />
  </StrictMode>,
);
