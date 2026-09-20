import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { PawBadge } from '../../src/components/PawBadge';
import { getPlaceById } from '../../src/data/places';
import { colors, fonts, fontSizes, spacing } from '../../src/theme';

export default function CheckinStub() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = getPlaceById(id ?? '');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.content}>
        <PawBadge size={72} />
        <Text style={styles.title}>Dejar una huella</Text>
        <Text style={styles.subtitle}>
          Acá va el flujo de check-in con foto en 3 pasos (próximo bloque){place ? ` en ${place.name}` : ''}.
        </Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulVereda,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xl,
    color: colors.textOnDark,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
});
