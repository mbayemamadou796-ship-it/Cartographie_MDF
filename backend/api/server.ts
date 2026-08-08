import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';
import { logger } from '../utils/logger';

const app = express();
const PORT = Number(process.env.API_PORT ?? 3001);
// Deux frontends distincts consomment l'API : le Bureau/Cartographie (3000)
// et le Formulaire public (3002). CORS_ORIGIN accepte une liste séparée par
// des virgules pour surcharger en production.
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:3000,http://localhost:3002';

app.use(cors({ origin: CORS_ORIGIN.split(',').map(o => o.trim()) }));
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
  logger.info(`API Cartographie MDF démarrée sur http://localhost:${PORT} (CORS: ${CORS_ORIGIN})`);
});

export default app;
