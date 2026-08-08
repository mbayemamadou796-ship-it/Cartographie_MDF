import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppFormulaire } from './app/AppFormulaire';
import './index.css';

// URL de l'application Bureau (Cartographie) — les deux applications sont
// servies séparément : Bureau sur le port 3000, Formulaire sur le port 3002.
const BUREAU_URL: string =
  ((import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_BUREAU_URL) ??
  `${window.location.protocol}//${window.location.hostname}:3000`;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppFormulaire onSwitchToBureau={() => window.open(BUREAU_URL, '_blank', 'noopener,noreferrer')} />
  </StrictMode>,
);
