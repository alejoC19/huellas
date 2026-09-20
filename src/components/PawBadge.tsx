import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { PawIcon } from './PawIcon';

type Props = {
  size?: number;
  background?: string;
  pawColor?: string;
};

export function PawBadge({
  size = 88,
  background = colors.verdeHuella,
  pawColor = colors.cremaBase,
}: Props) {
  return (
    <View
      style={[
        styles.badge,
        { width: size, height: size, borderRadius: size * 0.28, backgroundColor: background },
      ]}
    >
      <PawIcon size={size * 0.56} color={pawColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
