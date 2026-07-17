import { shouldServeSpa } from './spa-routing';

describe('shouldServeSpa', () => {
  it('sirve rutas profundas del front (el bug de Render)', () => {
    expect(shouldServeSpa('GET', '/catalogo/cmrp5oqsm000101lgk81pgu99')).toBe(
      true,
    );
    expect(shouldServeSpa('GET', '/catalogo')).toBe(true);
    expect(shouldServeSpa('GET', '/login')).toBe(true);
    expect(shouldServeSpa('GET', '/deseados/nuevo')).toBe(true);
    expect(shouldServeSpa('GET', '/estadisticas')).toBe(true);
    expect(shouldServeSpa('HEAD', '/catalogo/abc')).toBe(true);
  });

  it('no intercepta la API', () => {
    expect(shouldServeSpa('GET', '/api')).toBe(false);
    expect(shouldServeSpa('GET', '/api/books')).toBe(false);
    expect(shouldServeSpa('GET', '/api/books/cmrp5oqsm000101lgk81pgu99')).toBe(
      false,
    );
  });

  it('no intercepta assets estáticos', () => {
    expect(shouldServeSpa('GET', '/main.js')).toBe(false);
    expect(shouldServeSpa('GET', '/styles.css')).toBe(false);
    expect(shouldServeSpa('GET', '/favicon.ico')).toBe(false);
  });

  it('ignora métodos que no son GET/HEAD', () => {
    expect(shouldServeSpa('POST', '/catalogo')).toBe(false);
    expect(shouldServeSpa('PUT', '/login')).toBe(false);
  });
});
