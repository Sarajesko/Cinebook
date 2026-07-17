/** Límites más altos en test para no romper e2e/CI. */
const isTest = process.env.NODE_ENV === 'test';

export const THROTTLE_TTL_MS = 60_000;

export const THROTTLE_GLOBAL_LIMIT = isTest ? 10_000 : 200;
export const THROTTLE_AUTH_LIMIT = isTest ? 10_000 : 10;
export const THROTTLE_ISBN_LIMIT = isTest ? 10_000 : 20;
