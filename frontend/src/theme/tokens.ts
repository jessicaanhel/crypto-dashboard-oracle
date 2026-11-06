export const COLORS = {
  background: '#0d1017',
  surface: '#161a22',
  border: 'rgba(255,255,255,0.06)',
  borderSubtle: 'rgba(255,255,255,0.04)',
  textPrimary: '#e8ebf0',
  textSecondary: '#9aa0ac',
  textMuted: '#6b7180',
  textLabel: '#8b9099',
  accent: '#5b7fff',
  accentSoft: 'rgba(91,127,255,0.16)',
  accentText: '#dfe6ff',
  positive: '#34d1a1',
  negative: '#ff6b6b',
  large: '#a98bff',
  largeBg: 'rgba(143,107,255,0.16)',
  pillMutedBg: 'rgba(255,255,255,0.06)',
  pillMutedText: '#c7cbd4',
  inputBorder: 'rgba(255,255,255,0.08)',
};

export const RADIUS = {
  card: 18,
  input: 12,
  pill: 999,
};

export const changeColor = (value: number) => (value >= 0 ? COLORS.positive : COLORS.negative);
