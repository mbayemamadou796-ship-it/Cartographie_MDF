import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
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

app.use(cors({ origin: CORS_ORIGIN ? CORS_ORIGIN.split(',').map(o => o.trim()) : true }));
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
