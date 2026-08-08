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

/**
 * Protection anti-spam du formulaire public d'adhésion :
 * 10 soumissions / 15 minutes / IP.
 */
export const publicDemandeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de soumissions. Réessayez dans quelques minutes.' }
});

/**
 * Suivi public d'une demande par identifiant : plus permissif que la
 * soumission, mais borné pour empêcher l'énumération des identifiants.
 */
export const publicTrackingRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Trop de requêtes de suivi. Réessayez dans quelques minutes.' }
});
