import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { PawBadge } from '../../src/components/PawBadge';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';

type Step = 'form' | 'done';

export default function DejarResena() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((state) => state.session);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [placeName, setPlaceName] = useState<string | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [text, setText] = useState('');
  const [step, setStep] = useState<Step>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !session) {
      setLoadingPlace(false);
      return;
    }
    let mounted = true;

    (async () => {
      const [{ data: placeRow }, { data: checkinRow }, { data: reviewRow }] = await Promise.all([
        supabase.from('places').select('name').eq('id', id).single(),
        supabase
          .from('checkins')
          .select('id')
          .eq('place_id', id)
          .eq('user_id', session.user.id)
          .limit(1)
          .maybeSingle(),
        supabase
          .from('reviews')
          .select('id')
          .eq('place_id', id)
          .eq('user_id', session.user.id)
          .maybeSingle(),
      ]);
      if (!mounted) return;
      setPlaceName(placeRow?.name ?? null);
      setEligible(Boolean(checkinRow) && !reviewRow);
      setLoadingPlace(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id, session]);

  const submitReview = async () => {
    if (!session || !id || text.trim().length < 10) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert({ place_id: id, user_id: session.user.id, text: text.trim() });
      if (insertError) throw insertError;
      await refreshProfile();
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlace) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.verdeHuella} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step === 'form' && !eligible && (
          <View style={styles.centerBody}>
            <Ionicons name="paw-outline" size={40} color={colors.textOnDarkMuted} />
            <Text style={styles.title}>Todavía no podés reseñar este lugar</Text>
            <Text style={styles.subtitle}>
              Las reseñas verificadas son solo de lugares donde ya dejaste tu huella con una foto.
              {placeName ? ` Andá a "${placeName}" y hacé check-in primero.` : ''}
            </Text>
            <Button label="Volver" variant="secondary" onPress={() => router.back()} />
          </View>
        )}

        {step === 'form' && eligible && (
          <View style={styles.stepBody}>
            <Text style={styles.title}>Reseña verificada</Text>
            <Text style={styles.subtitle}>
              {placeName ? `Contanos cómo te fue en ${placeName}.` : 'Contanos cómo te fue.'} Sumás
              +30 pts.
            </Text>

            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="¿Qué te gustó del lugar? ¿Algo que otros dueños deberían saber?"
              placeholderTextColor={colors.textOnDarkMuted}
              style={styles.textInput}
              multiline
              maxLength={500}
            />
            <Text style={styles.counter}>{text.trim().length}/500 · mínimo 10 caracteres</Text>

            {error ? <Text style={styles.errorInline}>{error}</Text> : null}

            <Button
              label={submitting ? 'Publicando…' : 'Publicar reseña'}
              onPress={submitReview}
              loading={submitting}
              disabled={text.trim().length < 10}
            />
          </View>
        )}

        {step === 'done' && (
          <View style={styles.centerBody}>
            <PawBadge size={88} />
            <Text style={styles.title}>¡Gracias por tu reseña!</Text>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>+30 pts</Text>
            </View>
            <Button label="Listo" onPress={() => router.back()} />
          </View>
        )}
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
    paddingHorizontal: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.azulVereda,
  },
  centerBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stepBody: {
    flex: 1,
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textOnDark,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
  textInput: {
    minHeight: 140,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderOnDark,
    backgroundColor: 'rgba(255,253,246,0.08)',
    color: colors.textOnDark,
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  counter: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textOnDarkMuted,
    textAlign: 'right',
  },
  errorInline: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
  },
  pointsPill: {
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  pointsText: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.md,
    color: colors.azulVereda,
  },
});
