import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { PawBadge } from '../../src/components/PawBadge';
import { TextField } from '../../src/components/TextField';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, spacing } from '../../src/theme';

export default function SignUp() {
  const signUp = useAuthStore((state) => state.signUp);
  const loading = useAuthStore((state) => state.loading);

  const [ownerName, setOwnerName] = useState('');
  const [petName, setPetName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!ownerName || !petName || !email || !password) {
      setError('Completá todos los campos.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña necesita al menos 6 caracteres.');
      return;
    }

    const { error: signUpError } = await signUp({ email, password, ownerName, petName });
    if (signUpError) {
      setError(signUpError);
      return;
    }
    router.replace('/loading');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <PawBadge size={64} />
            <Text style={styles.title}>Creá tu cuenta</Text>
            <Text style={styles.subtitle}>Empezá a dejar huellas por Buenos Aires.</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Tu nombre"
              placeholder="Pachi"
              value={ownerName}
              onChangeText={setOwnerName}
              autoCapitalize="words"
            />
            <TextField
              label="Nombre de tu perro"
              placeholder="Tita"
              value={petName}
              onChangeText={setPetName}
              autoCapitalize="words"
            />
            <TextField
              label="Email"
              placeholder="vos@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextField
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            <Button label="Empezar a huellar" loading={loading} onPress={handleSubmit} />
            <Button
              label="Ya tengo cuenta"
              variant="secondary"
              onPress={() => router.replace('/auth/login')}
            />
            <Text style={styles.termsText}>Al continuar aceptás nuestros términos.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxxl,
    gap: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xxl,
    color: colors.textOnDark,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
  form: {
    gap: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
  },
  actions: {
    gap: spacing.md,
  },
  termsText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
