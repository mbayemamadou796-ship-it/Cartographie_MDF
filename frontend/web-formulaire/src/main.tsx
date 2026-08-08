import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppFormulaire } from './app/AppFormulaire';
import './index.css';

// Application publique : aucun lien vers l'espace Bureau (onSwitchToBureau
// volontairement absent — le ruban de bascule ne s'affiche alors pas).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppFormulaire />
  </StrictMode>,
);
