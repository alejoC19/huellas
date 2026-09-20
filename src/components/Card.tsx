import { StyleSheet, View, ViewProps } from 'react-native';

import { colors, radii, shadow, spacing } from '../theme';

type Variant = 'light' | 'dark' | 'flat';

type Props = ViewProps & {
  variant?: Variant;
  padded?: boolean;
};

export function Card({ variant = 'light', padded = true, style, children, ...rest }: Props) {
  return (
    <View
      style={[styles.base, variantStyles[variant], padded && styles.padded, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    ...shadow.soft,
  },
  padded: {
    padding: spacing.xl,
  },
});

const variantStyles: Record<Variant, object> = {
  light: { backgroundColor: colors.white },
  dark: { backgroundColor: colors.azulVereda, shadowOpacity: 0 },
  flat: { backgroundColor: colors.cremaBase, shadowOpacity: 0 },
};
