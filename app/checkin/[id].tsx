import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { PawBadge } from '../../src/components/PawBadge';
import { PawIcon } from '../../src/components/PawIcon';
import { StarPicker } from '../../src/components/StarPicker';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { formatDistance, haversineDistanceMeters } from '../../src/utils/geo';

type Step = 'camera' | 'preview' | 'done';

const STEP_NUMBER: Record<Step, number> = { camera: 1, preview: 2, done: 3 };

type CheckinPlace = {
  id: string;
  name: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
};

export default function CheckIn() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const session = useAuthStore((state) => state.session);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const [place, setPlace] = useState<CheckinPlace | null>(null);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [step, setStep] = useState<Step>('camera');
  const [distanceLabel, setDistanceLabel] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      setLoadingPlace(true);
      const { data } = await supabase
        .from('places')
        .select('id, name, neighborhood, latitude, longitude')
        .eq('id', id)
        .single();
      if (mounted) {
        setPlace(data);
        setLoadingPlace(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!place) return;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      const meters = haversineDistanceMeters(
        position.coords.latitude,
        position.coords.longitude,
        place.latitude,
        place.longitude
      );
      setDistanceLabel(formatDistance(meters));
    })();
  }, [place]);

  if (loadingPlace) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.verdeHuella} />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No encontramos este lugar.</Text>
        <Button label="Volver" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  const takePhoto = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.6 });
    if (photo) {
      setPhotoUri(photo.uri);
      setStep('preview');
    }
  };

  const submitCheckin = async () => {
    if (!session || !photoUri) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(photoUri);
      const blob = await response.blob();
      const path = `${session.user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('checkins')
        .upload(path, blob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('checkins').getPublicUrl(path);
      const photoUrl = publicUrlData.publicUrl;

      const { data: checkinRow, error: checkinError } = await supabase
        .from('checkins')
        .insert({ user_id: session.user.id, place_id: place.id, photo_url: photoUrl, rating })
        .select()
        .single();

      if (checkinError || !checkinRow) {
        throw checkinError ?? new Error('No se pudo crear el check-in.');
      }

      await supabase.from('posts').insert({
        user_id: session.user.id,
        place_id: place.id,
        checkin_id: checkinRow.id,
        image_url: photoUrl,
        text: caption,
      });

      await refreshProfile();
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo salió mal. Probá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepNumber = STEP_NUMBER[step];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step !== 'done' && (
          <View style={styles.stepHeader}>
            <Pressable onPress={() => router.back()}>
              <Ionicons name="close" size={22} color={colors.textOnDark} />
            </Pressable>
            <View style={styles.stepHeaderText}>
              <Text style={styles.stepTitle}>Dejar una huella</Text>
              <Text style={styles.stepSubtitle}>Paso {stepNumber} de 3</Text>
            </View>
            <View style={{ width: 22 }} />
          </View>
        )}

        {step !== 'done' && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(stepNumber / 3) * 100}%` }]} />
          </View>
        )}

        {step === 'camera' && (
          <View style={styles.stepBody}>
            <View style={styles.locationPill}>
              <Ionicons name="location" size={14} color={colors.verdeHuella} />
              <Text style={styles.locationText}>
                {place.name}
                {distanceLabel ? ` · a ${distanceLabel}` : ''}
              </Text>
            </View>

            <View style={styles.cameraFrame}>
              {permission?.granted ? (
                <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Ionicons name="camera-outline" size={32} color={colors.textOnDarkMuted} />
                  <Text style={styles.permissionText}>Necesitamos acceso a tu cámara</Text>
                  <Button label="Dar permiso" variant="secondary" onPress={requestPermission} />
                </View>
              )}
            </View>

            <Text style={styles.instructionsTitle}>Sacá una foto en el lugar</Text>
            <Text style={styles.instructionsSubtitle}>
              La foto confirma que estuviste ahí y suma tus puntos.
            </Text>

            <Button
              label="Sacar la foto"
              onPress={takePhoto}
              disabled={!permission?.granted}
            />
          </View>
        )}

        {step === 'preview' && photoUri && (
          <View style={styles.stepBody}>
            <View style={[styles.cameraFrame, styles.previewFrame]}>
              <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            </View>

            <View style={styles.ratingBlock}>
              <Text style={styles.ratingLabel}>¿Cómo estuvo?</Text>
              <StarPicker value={rating} onChange={setRating} />
            </View>

            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Contanos algo (opcional)"
              placeholderTextColor={colors.textOnDarkMuted}
              style={styles.captionInput}
              multiline
            />

            {error ? <Text style={styles.errorInline}>{error}</Text> : null}

            <Button
              label={submitting ? 'Subiendo…' : 'Confirmar huella'}
              onPress={submitCheckin}
              loading={submitting}
            />
            <Button
              label="Sacar otra"
              variant="secondary"
              disabled={submitting}
              onPress={() => {
                setPhotoUri(null);
                setError(null);
                setStep('camera');
              }}
            />
          </View>
        )}

        {step === 'done' && (
          <View style={styles.doneBody}>
            <PawBadge size={88} />
            <Text style={styles.doneTitle}>¡Dejaste tu huella!</Text>
            <View style={styles.donePointsPill}>
              <PawIcon size={16} color={colors.azulVereda} />
              <Text style={styles.donePointsText}>+50 pts</Text>
            </View>
            <Text style={styles.doneSubtitle}>
              {place.name} · {place.neighborhood}
            </Text>
            <Button label="Listo" onPress={() => router.replace('/(tabs)')} />
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
    gap: spacing.md,
    backgroundColor: colors.azulVereda,
  },
  errorText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.md,
    color: colors.textOnDark,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  stepHeaderText: {
    alignItems: 'center',
  },
  stepTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textOnDark,
  },
  stepSubtitle: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textOnDarkMuted,
  },
  progressTrack: {
    height: 4,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,253,246,0.16)',
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.verdeHuella,
  },
  stepBody: {
    flex: 1,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,253,246,0.1)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  locationText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textOnDark,
  },
  cameraFrame: {
    flex: 1,
    borderRadius: radii.xl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,253,246,0.06)',
    borderWidth: 2,
    borderColor: colors.borderOnDark,
    borderStyle: 'dashed',
  },
  previewFrame: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 240,
  },
  ratingBlock: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingLabel: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  permissionText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
  instructionsTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textOnDark,
  },
  instructionsSubtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    marginBottom: spacing.sm,
  },
  captionInput: {
    minHeight: 56,
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
  errorInline: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
  },
  doneBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  doneTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xxl,
    color: colors.textOnDark,
  },
  donePointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  donePointsText: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.md,
    color: colors.azulVereda,
  },
  doneSubtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    marginBottom: spacing.lg,
  },
});
