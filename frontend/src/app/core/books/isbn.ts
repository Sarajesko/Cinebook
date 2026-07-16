/** Normalize ISBN by stripping hyphens/spaces. */
export function normalizeIsbn(raw: string): string {
  return raw.replace(/[-\s]/g, '').trim().toUpperCase();
}

/**
 * Accept ISBN-10 / bookland EAN-13 (978/979) from barcode text.
 * Returns normalized value or null if not a plausible ISBN shape.
 */
export function parseIsbnFromBarcode(raw: string): string | null {
  const cleaned = normalizeIsbn(raw);
  if (!cleaned) return null;

  if (/^\d{13}$/.test(cleaned)) {
    if (cleaned.startsWith('978') || cleaned.startsWith('979')) {
      return cleaned;
    }
    return isValidIsbn13(cleaned) ? cleaned : null;
  }

  if (/^\d{9}[\dX]$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export function isValidIsbn10(isbn: string): boolean {
  const s = normalizeIsbn(isbn);
  if (!/^\d{9}[\dX]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(s[i]) * (10 - i);
  }
  const check = s[9] === 'X' ? 10 : Number(s[9]);
  sum += check;
  return sum % 11 === 0;
}

export function isValidIsbn13(isbn: string): boolean {
  const s = normalizeIsbn(isbn);
  if (!/^\d{13}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(s[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(s[12]);
}

export function isPlausibleIsbn(raw: string): boolean {
  return parseIsbnFromBarcode(raw) != null;
}
