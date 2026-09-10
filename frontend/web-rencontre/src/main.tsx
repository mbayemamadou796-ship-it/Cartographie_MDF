import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppRencontre } from './app/AppRencontre';
import { RencontreService } from '../../web-cartographie/src/services/rencontreService';
import './index.css';

// Charge les rencontres publiées depuis le backend (un visiteur n'a pas le
// localStorage du bureau) — les vues abonnées se mettent à jour au retour.
RencontreService.refreshPublicRencontres();

// Application publique du sondage Rencontre : aucun lien vers l'espace Bureau
// (onSwitchToBureau volontairement absent). Le lien/QR partagé par le bureau
// peut cibler une rencontre précise via ?rencontre=<id>.
const initialRencontreId =
  new URLSearchParams(window.location.search).get('rencontre') ?? undefined;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRencontre initialRencontreId={initialRencontreId} />
  </StrictMode>,
);
