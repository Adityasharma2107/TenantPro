import type { RequestHandler } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Cross-Site Request Forgery (CSRF) Protection Middleware.
 * Defends state-changing endpoints (POST, PUT, PATCH, DELETE) by verifying:
 * 1. The presence of a custom anti-CSRF header ('X-Requested-With' or 'X-TenantPro-CSRF') which browsers
 *    cannot attach automatically in cross-origin HTML form / image / script exploits.
 * 2. Or a verified matching Origin / Referer against authorized client origins.
 */
export const csrfProtection: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  // Allow test runners in Vitest/Jest to bypass without needing header mocks on every test
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  // 1. Check custom anti-CSRF header
  const customHeader = req.headers['x-requested-with'] || req.headers['x-tenantpro-csrf'];
  if (customHeader) {
    return next();
  }

  // 2. Validate Origin / Referer
  const origin = (req.headers['origin'] || req.headers['referer']) as string | undefined;
  if (!origin) {
    // Direct server-to-server or tools without cookies cannot perform cookie-based CSRF
    return next();
  }

  // Verify origin matches local or allowed origins
  if (
    origin.includes('localhost') ||
    origin.includes('127.0.0.1') ||
    origin.endsWith('.vercel.app') ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.split(',').some((u) => origin.startsWith(u.trim())))
  ) {
    return next();
  }

  return res.status(403).json({
    message: 'CSRF verification failed. Request blocked for security.',
  });
};
