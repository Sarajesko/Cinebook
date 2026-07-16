import {
  conditionLabel,
  estadoLabel,
  flagEmoji,
  starsLabel,
} from './book.model';

describe('book.model helpers', () => {
  it('maps flags', () => {
    expect(flagEmoji('ES')).toBe('🇪🇸');
    expect(flagEmoji('US/UK')).toBe('🇺🇸🇬🇧');
    expect(flagEmoji('USA')).toBe('🇺🇸🇬🇧');
    expect(flagEmoji('FR')).toBe('🇫🇷');
    expect(flagEmoji('PT')).toBe('🇵🇹');
    expect(flagEmoji('CAT')).toBe('🏴󠁥󠁳󠁣󠁴󠁿');
  });

  it('labels condition and estado', () => {
    expect(conditionLabel('nuevo')).toBe('Nuevo');
    expect(conditionLabel('segunda_mano')).toBe('Segunda mano');
    expect(estadoLabel('por_leer')).toBe('Por leer');
  });

  it('builds stars label', () => {
    expect(starsLabel(8)).toBe('★★★★★★★★☆☆');
    expect(starsLabel(1)).toBe('★☆☆☆☆☆☆☆☆☆');
  });
});
