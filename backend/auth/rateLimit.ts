import rateLimit from 'express-rate-limit';

/**
 * Protection brute-force du login : 5 tentatives / 15 minutes / IP
 * (règle docs/SECURITE.md §4.4). Les connexions réussies ne comptent pas.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }
});
