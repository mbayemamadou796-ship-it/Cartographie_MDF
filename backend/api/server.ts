import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors, { CorsOptionsDelegate } from 'cors';
import { apiRouter } from './routes';
import { logger } from '../utils/logger';

const app = express();
// PORT est imposé par les hébergeurs (Render, Railway...) ; API_PORT reste la
// variable utilisée en développement local (3001 par défaut).
const PORT = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
// Trois frontends distincts consomment l'API : Bureau/Cartographie (3000),
// Formulaire public (3002) et Rencontre/Sondage public (3003). En production,
// CORS_ORIGIN (liste séparée par des virgules) impose la liste stricte des
// origines autorisées ; en développement (variable absente), toute origine est
// acceptée — indispensable pour tester depuis un téléphone ou un autre PC du
// réseau local (l'origine est alors http://192.168.x.x:300x, pas localhost).
const CORS_ORIGIN = process.env.CORS_ORIGIN;
const allowedOrigins = CORS_ORIGIN ? CORS_ORIGIN.split(',').map(o => o.trim()) : true;

/**
 * Les routes publiques (/api/public/*) acceptent TOUTES les origines.
 *
 * Ce sont des points d'entrée anonymes destinés aux formulaires publics
 * (demande d'adhésion, sondage Rencontre) : y restreindre le CORS n'apporte
 * aucune sécurité — n'importe qui peut les appeler hors navigateur, en une
 * ligne de commande — mais bloque les vrais visiteurs dès qu'une application
 * est ajoutée ou qu'une URL change et que CORS_ORIGIN n'est pas mis à jour.
 * C'est exactement ce qui a rendu le sondage muet : l'URL de web-rencontre
 * manquait dans CORS_ORIGIN, les réponses n'atteignaient jamais la base.
 * Ces routes restent protégées par le rate limiting, la validation stricte des
 * schémas et le forçage des statuts côté serveur.
 *
 * Tout le reste de l'API (données du bureau, authentification) conserve la
 * liste stricte d'origines imposée par CORS_ORIGIN en production.
 */
const corsDelegate: CorsOptionsDelegate<Request> = (req, callback) => {
  const isPublicRoute = req.path.startsWith('/api/public');
  callback(null, { origin: isPublicRoute ? true : allowedOrigins });
};

app.use(cors(corsDelegate));
// Limite haute : les photos de membres et le logo peuvent être des data-URLs
// base64 (jusqu'à 5 Mo pièce) transportées dans les PUT bulk.
app.use(express.json({ limit: '50mb' }));

app.use('/api', apiRouter);

// Gestionnaire d'erreurs central : ne jamais exposer les détails internes.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.error(message);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
});

app.listen(PORT, () => {
  logger.info(`API Cartographie MDF démarrée sur http://localhost:${PORT} (CORS: ${CORS_ORIGIN ?? 'toutes origines — mode développement'})`);
});

export default app;
