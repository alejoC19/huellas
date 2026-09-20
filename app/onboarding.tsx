import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { PawBadge } from '../src/components/PawBadge';
import { colors, fonts, fontSizes, spacing } from '../src/theme';

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.isotipo}>
            <PawBadge size={96} />
          </View>

          <View style={styles.textBlock}>
            <Text style={styles.title}>
              Cada perro deja <Text style={styles.titleAccent}>una huella.</Text>
            </Text>
            <Text style={styles.subtitle}>
              Juntas, arman el mapa de Buenos Aires que todavía no existe.
            </Text>
          </View>

          <View style={styles.actions}>
            <Button
              label="Empezar a huellar"
              variant="primary"
              onPress={() => router.push('/auth/signup')}
            />
            <Button
              label="Ya tengo cuenta"
              variant="secondary"
              onPress={() => router.push('/auth/login')}
              style={styles.secondaryButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.azulVereda,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  isotipo: {
    alignItems: 'center',
    marginTop: spacing.xxxl,
  },
  textBlock: {
    gap: spacing.lg,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.display,
    lineHeight: 40,
    color: colors.textOnDark,
  },
  titleAccent: {
    color: colors.verdeHuella,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.md,
    lineHeight: 24,
    color: colors.textOnDarkMuted,
  },
  actions: {
    gap: spacing.md,
  },
  secondaryButton: {
    marginTop: 0,
  },
});
