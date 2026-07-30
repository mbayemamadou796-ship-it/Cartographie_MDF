# Security Policy & Rules — Cartographie MDF

For the detailed French documentation on security rules (MitM, SQL Injection, XSS, CSRF, Password Hashing, RBAC, File Upload Security, RGPD Compliance, and Secrets Management), please refer to:

👉 **[SECURITE.md](./SECURITE.md)**

---

## Quick Checklist Summary

1. **MitM Protection**: HTTPS/TLS 1.3 forced, HSTS enabled, `HttpOnly` + `Secure` + `SameSite=Lax/Strict` on all cookies.
2. **SQL / Injection Protection**: Parameterized queries & ORM (Prisma/Drizzle/Knex) mandatory. Strict Zod schema validation on all API endpoints. No raw SQL concatenation.
3. **XSS & CSRF Protection**: React auto-escaping, DOMPurify for rich HTML, CSP headers (`Content-Security-Policy`), anti-CSRF token verification on state-changing API routes.
4. **Authentication & Password Security**: Argon2id / bcrypt (cost >= 12) for password hashing. Rate limiting (5 failed attempts limit) on `/api/login`. Short-lived JWT Access Tokens (15 min). No hardcoded credentials or public demo passwords.
5. **RBAC & Authorization**: Server-side role enforcement on every API route (`admin`, `referent`, `user`). Scope isolation for referents restricted strictly to their assigned zone members and zone cards (`GeographicZonesView`). Dynamic navigation tab guard resetting non-admin sessions to `directory`.
6. **Data Privacy (GDPR)**: AES-256 encryption at rest. Log sanitization (no plain passwords or tokens in application logs). Audit trails for critical user & data operations.
7. **File Upload Security**: MIME type & binary magic bytes verification, file size limits (10MB Excel, 2MB image), random UUID renaming, Formula injection stripping.
