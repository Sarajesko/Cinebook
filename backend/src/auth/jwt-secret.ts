/** Fallback solo para desarrollo local. Nunca en production. */
export const JWT_DEV_FALLBACK = 'cambia-este-secreto-en-local';

const INSECURE_SECRETS = new Set([
  JWT_DEV_FALLBACK,
  'cambia-este-secreto-en-compose',
  'change-me',
  'secret',
]);

/**
 * Resuelve el secreto JWT.
 * En production exige un valor fuerte (no vacío ni placeholders conocidos).
 */
export function resolveJwtSecret(
  secret: string | undefined | null,
  nodeEnv: string | undefined = process.env.NODE_ENV,
): string {
  const trimmed = secret?.trim() || '';
  const isProd = nodeEnv === 'production';

  if (isProd) {
    if (!trimmed || INSECURE_SECRETS.has(trimmed)) {
      throw new Error(
        'JWT_SECRET must be set to a strong unique value when NODE_ENV=production',
      );
    }
    return trimmed;
  }

  return trimmed || JWT_DEV_FALLBACK;
}
