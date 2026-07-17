/** Reglas SPA: servir index.html en rutas del front, no en /api ni assets. */
export function shouldServeSpa(method: string, pathOrUrl: string): boolean {
  if (method !== 'GET' && method !== 'HEAD') {
    return false;
  }
  const path = pathOrUrl.split('?')[0] || '';
  if (path.startsWith('/api')) {
    return false;
  }
  // main.js, styles.css, favicon.ico…
  if (/\.[a-zA-Z0-9]{1,8}$/.test(path)) {
    return false;
  }
  return true;
}
