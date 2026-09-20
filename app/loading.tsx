import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PawBadge } from '../src/components/PawBadge';
import { PawTrail } from '../src/components/PawTrail';
import { colors, fonts, fontSizes, spacing } from '../src/theme';

export default function Loading() {
  const navigated = useRef(false);

  const goToApp = useCallback(() => {
    if (navigated.current) return;
    navigated.current = true;
    setTimeout(() => router.replace('/(tabs)'), 350);
  }, []);

  return (
    <View style={styles.container}>
      <PawTrail onComplete={goToApp} />
      <SafeAreaView style={styles.content}>
        <View style={styles.top}>
          <PawBadge size={72} />
        </View>
        <Text style={styles.text}>Preparando tu huella…</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  top: {
    marginTop: spacing.xl,
  },
  text: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
});
