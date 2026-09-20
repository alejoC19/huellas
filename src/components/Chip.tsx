import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '../theme';

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'light' | 'dark';
};

export function Chip({ label, active, onPress, tone = 'light' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        tone === 'dark' ? styles.chipDark : styles.chipLight,
        active && styles.chipActive,
      ]}
    >
      <Text
        style={[
          styles.label,
          tone === 'dark' ? styles.labelDark : styles.labelLight,
          active && styles.labelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipLight: {
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  chipDark: {
    backgroundColor: 'rgba(255, 253, 246, 0.08)',
    borderColor: colors.borderOnDark,
  },
  chipActive: {
    backgroundColor: colors.verdeHuella,
    borderColor: colors.verdeHuella,
  },
  label: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
  },
  labelLight: {
    color: colors.textPrimary,
  },
  labelDark: {
    color: colors.textOnDark,
  },
  labelActive: {
    color: colors.azulVereda,
  },
});
