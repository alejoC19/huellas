import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '../theme';
import { PawIcon } from './PawIcon';

type Props = {
  title: string;
  subtitle: string;
  dark?: boolean;
};

export function ScreenPlaceholder({ title, subtitle, dark }: Props) {
  return (
    <View style={[styles.container, dark ? styles.dark : styles.light]}>
      <PawIcon size={48} color={dark ? colors.verdeHuella : colors.verdeParque} />
      <Text style={[styles.title, dark && styles.titleOnDark]}>{title}</Text>
      <Text style={[styles.subtitle, dark && styles.subtitleOnDark]}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
  },
  light: {
    backgroundColor: colors.cremaBase,
  },
  dark: {
    backgroundColor: colors.azulVereda,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleOnDark: {
    color: colors.textOnDark,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  subtitleOnDark: {
    color: colors.textOnDarkMuted,
  },
});
