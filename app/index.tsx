import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { PawBadge } from '../src/components/PawBadge';
import { useAuthStore } from '../src/store/useAuthStore';
import { colors } from '../src/theme';

export default function Index() {
  const initialized = useAuthStore((state) => state.initialized);
  const session = useAuthStore((state) => state.session);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!initialized) {
    return (
      <View style={styles.splash}>
        <PawBadge size={64} />
      </View>
    );
  }

  return <Redirect href={session ? '/(tabs)' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.azulVereda,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
