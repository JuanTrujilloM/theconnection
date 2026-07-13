export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Short-lived access token, long-lived refresh token. Kept here so the cookie
// maxAge and the JWT/refresh TTLs stay in lockstep.
export const ACCESS_TOKEN_TTL = '15m';
export const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// The refresh cookie is only ever sent to /auth routes, never on every API call.
export const REFRESH_COOKIE_PATH = '/auth';
