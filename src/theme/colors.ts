export const colors = {
  azulVereda: '#213346',
  verdeHuella: '#BFE180',
  verdeParque: '#495B42',
  amarilloSolera: '#FFF2B0',
  cremaBase: '#FFFDF6',

  white: '#FFFFFF',
  black: '#000000',

  textOnDark: '#FFFDF6',
  textOnDarkMuted: 'rgba(255, 253, 246, 0.7)',
  textPrimary: '#213346',
  textMuted: 'rgba(33, 51, 70, 0.6)',

  border: 'rgba(33, 51, 70, 0.08)',
  borderOnDark: 'rgba(255, 253, 246, 0.14)',

  overlay: 'rgba(33, 51, 70, 0.45)',
} as const;

export type ColorToken = keyof typeof colors;
