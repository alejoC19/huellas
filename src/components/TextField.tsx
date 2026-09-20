import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  tone?: 'light' | 'dark';
};

export function TextField({ label, error, tone = 'dark', style, ...rest }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, tone === 'dark' ? styles.labelDark : styles.labelLight]}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={tone === 'dark' ? colors.textOnDarkMuted : colors.textMuted}
        style={[
          styles.input,
          tone === 'dark' ? styles.inputDark : styles.inputLight,
          error && styles.inputError,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
  },
  labelDark: {
    color: colors.textOnDark,
  },
  labelLight: {
    color: colors.textPrimary,
  },
  input: {
    height: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.md,
    borderWidth: 1,
  },
  inputDark: {
    backgroundColor: 'rgba(255, 253, 246, 0.08)',
    borderColor: colors.borderOnDark,
    color: colors.textOnDark,
  },
  inputLight: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: '#E38585',
  },
  error: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: '#E38585',
  },
});
