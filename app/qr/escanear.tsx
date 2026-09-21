import { Ionicons } from '@expo/vector-icons';
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { PawBadge } from '../../src/components/PawBadge';
import { PawIcon } from '../../src/components/PawIcon';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';

type Step = 'scanning' | 'checking' | 'success' | 'already' | 'invalid';

export default function EscanearQR() {
  const session = useAuthStore((state) => state.session);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<Step>('scanning');
  const [placeName, setPlaceName] = useState('');
  const scanningRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const handleScan = async ({ data }: BarcodeScanningResult) => {
    if (scanningRef.current || !session) return;
    scanningRef.current = true;
    setStep('checking');

    try {
      const { data: qrCode } = await supabase
        .from('qr_codes')
        .select('id, places(name, neighborhood)')
        .eq('code', data)
        .maybeSingle();

      if (!qrCode) {
        setStep('invalid');
        return;
      }

      const { error: redeemError } = await supabase
        .from('qr_redemptions')
        .insert({ user_id: session.user.id, qr_code_id: qrCode.id });

      if (redeemError) {
        if (redeemError.code === '23505') {
          setStep('already');
        } else {
          setStep('invalid');
        }
        return;
      }

      await refreshProfile();
      setPlaceName((qrCode.places as { name: string } | null)?.name ?? '');
      setStep('success');
    } catch {
      setStep('invalid');
    }
  };

  const resetScanner = () => {
    scanningRef.current = false;
    setStep('scanning');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step !== 'success' && (
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textOnDark} />
            </Pressable>
            <Text style={styles.headerTitle}>Huella escondida</Text>
            <View style={{ width: 22 }} />
          </View>
        )}

        {(step === 'scanning' || step === 'checking') && (
          <View style={styles.body}>
            <View style={styles.cameraFrame}>
              {permission?.granted ? (
                <CameraView
                  style={StyleSheet.absoluteFill}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={step === 'scanning' ? handleScan : undefined}
                />
              ) : (
                <View style={styles.cameraPlaceholder}>
                  <Ionicons name="qr-code-outline" size={32} color={colors.textOnDarkMuted} />
                  <Text style={styles.permissionText}>Necesitamos acceso a tu cámara</Text>
                  <Button label="Dar permiso" variant="secondary" onPress={requestPermission} />
                </View>
              )}
              <View style={styles.frameCorner} />
            </View>

            <Text style={styles.instructionsTitle}>Buscá el código QR escondido</Text>
            <Text style={styles.instructionsSubtitle}>
              Algunos lugares esconden una huella QR. Encontrala y escaneala para sumar puntos
              extra.
            </Text>
          </View>
        )}

        {step === 'success' && (
          <View style={styles.doneBody}>
            <PawBadge size={88} />
            <Text style={styles.doneTitle}>¡Encontraste la huella escondida!</Text>
            <View style={styles.donePointsPill}>
              <PawIcon size={16} color={colors.azulVereda} />
              <Text style={styles.donePointsText}>+75 pts</Text>
            </View>
            {placeName ? <Text style={styles.doneSubtitle}>{placeName}</Text> : null}
            <Button label="Listo" onPress={() => router.replace('/(tabs)')} />
          </View>
        )}

        {step === 'already' && (
          <View style={styles.doneBody}>
            <PawIcon size={48} color={colors.verdeParque} />
            <Text style={styles.doneTitle}>Ya escaneaste esta huella</Text>
            <Text style={styles.doneSubtitle}>Cada huella QR solo suma puntos una vez.</Text>
            <Button label="Volver" variant="secondary" onPress={() => router.back()} />
          </View>
        )}

        {step === 'invalid' && (
          <View style={styles.doneBody}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textOnDarkMuted} />
            <Text style={styles.doneTitle}>Ese código no es válido</Text>
            <Text style={styles.doneSubtitle}>Probá escanear de nuevo.</Text>
            <Button label="Escanear de nuevo" onPress={resetScanner} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textOnDark,
  },
  body: {
    flex: 1,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  cameraFrame: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 340,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,253,246,0.06)',
  },
  frameCorner: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    right: '15%',
    bottom: '20%',
    borderWidth: 2,
    borderColor: colors.verdeHuella,
    borderRadius: radii.md,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  permissionText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  instructionsTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textOnDark,
    textAlign: 'center',
  },
  instructionsSubtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
  doneBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  doneTitle: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textOnDark,
    textAlign: 'center',
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
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.sm,
    color: colors.azulVereda,
  },
  doneSubtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
  },
});
