import {
  isPlausibleIsbn,
  isValidIsbn10,
  isValidIsbn13,
  normalizeIsbn,
  parseIsbnFromBarcode,
} from './isbn';

describe('isbn utils', () => {
  it('normalizes hyphens and spaces', () => {
    expect(normalizeIsbn('978-0-306-40615-7')).toBe('9780306406157');
    expect(normalizeIsbn('978 0 306 40615 7')).toBe('9780306406157');
  });

  it('validates ISBN-13 check digit', () => {
    expect(isValidIsbn13('9780306406157')).toBeTrue();
    expect(isValidIsbn13('9780306406158')).toBeFalse();
  });

  it('validates ISBN-10 check digit', () => {
    expect(isValidIsbn10('0306406152')).toBeTrue();
    expect(isValidIsbn10('0306406153')).toBeFalse();
  });

  it('parses barcode text into ISBN (bookland EAN / ISBN-10)', () => {
    expect(parseIsbnFromBarcode('978-0-306-40615-7')).toBe('9780306406157');
    expect(parseIsbnFromBarcode('9788420674237')).toBe('9788420674237');
    expect(parseIsbnFromBarcode('0306406152')).toBe('0306406152');
    expect(parseIsbnFromBarcode('not-an-isbn')).toBeNull();
    expect(parseIsbnFromBarcode('123')).toBeNull();
  });

  it('isPlausibleIsbn mirrors parser', () => {
    expect(isPlausibleIsbn('9780306406157')).toBeTrue();
    expect(isPlausibleIsbn('abc')).toBeFalse();
  });
});
