import { JWT_DEV_FALLBACK, resolveJwtSecret } from './jwt-secret';

describe('resolveJwtSecret', () => {
  it('usa el fallback en desarrollo si falta JWT_SECRET', () => {
    expect(resolveJwtSecret(undefined, 'development')).toBe(JWT_DEV_FALLBACK);
    expect(resolveJwtSecret('  ', 'test')).toBe(JWT_DEV_FALLBACK);
  });

  it('respeta un secreto explícito fuera de production', () => {
    expect(resolveJwtSecret('mi-secreto-local', 'development')).toBe(
      'mi-secreto-local',
    );
  });

  it('falla en production si falta el secreto', () => {
    expect(() => resolveJwtSecret(undefined, 'production')).toThrow(
      /JWT_SECRET/,
    );
    expect(() => resolveJwtSecret('', 'production')).toThrow(/JWT_SECRET/);
  });

  it('rechaza placeholders conocidos en production', () => {
    expect(() =>
      resolveJwtSecret('cambia-este-secreto-en-local', 'production'),
    ).toThrow(/JWT_SECRET/);
    expect(() =>
      resolveJwtSecret('cambia-este-secreto-en-compose', 'production'),
    ).toThrow(/JWT_SECRET/);
  });

  it('acepta un secreto fuerte en production', () => {
    expect(
      resolveJwtSecret('prod-secret-at-least-32-chars!!', 'production'),
    ).toBe('prod-secret-at-least-32-chars!!');
  });
});
