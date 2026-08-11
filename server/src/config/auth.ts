import type { CookieOptions } from 'express';

// The cookie name is kept in one place so login and logout always use the same name.
export const AUTH_COOKIE_NAME = 'tenantpro_access_token';

const cookieBaseOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
};

// Browsers keep a successful login for seven days unless the user logs out sooner.
export const authCookieOptions: CookieOptions = {
  ...cookieBaseOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// Uses a private environment value instead of placing a secret in source control.
export const getJwtSecret = (): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is missing. Add it to server/.env before using authentication.');
  }

  return jwtSecret;
};

// Logout needs the same browser settings as login to reliably remove the cookie.
export const clearAuthCookieOptions = cookieBaseOptions;
