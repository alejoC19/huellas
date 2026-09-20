export const fonts = {
  displayBold: 'RedHatDisplay_700Bold',
  displayExtraBold: 'RedHatDisplay_800ExtraBold',
  textRegular: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemiBold: 'Inter_600SemiBold',
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
} as const;

export type FontToken = keyof typeof fonts;
