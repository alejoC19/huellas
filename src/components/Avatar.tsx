import { Image, StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { PawIcon } from './PawIcon';

type Props = {
  uri?: string | null;
  size?: number;
  background?: string;
  pawColor?: string;
};

export function Avatar({ uri, size = 44, background = colors.verdeHuella, pawColor }: Props) {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, dimensionStyle]} />;
  }

  return (
    <View style={[styles.placeholder, dimensionStyle, { backgroundColor: background }]}>
      <PawIcon size={size * 0.5} color={pawColor ?? colors.verdeParque} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.cremaBase,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
