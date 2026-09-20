import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '../theme';
import { MapSectionHandle, MapSectionProps } from './MapSection.types';

export const MapSection = forwardRef<MapSectionHandle, MapSectionProps>((_props, ref) => {
  useImperativeHandle(ref, () => ({
    animateToRegion: () => {},
  }));

  return (
    <View style={[StyleSheet.absoluteFill, styles.fallback]}>
      <Ionicons name="map" size={40} color={colors.verdeParque} />
      <Text style={styles.text}>
        El mapa interactivo se ve en iOS/Android (Expo Go).{'\n'}En web se muestra esta vista de
        reemplazo.
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.cremaBase,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xxxl,
  },
  text: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
