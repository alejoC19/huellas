import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { TextField } from '../../src/components/TextField';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, spacing } from '../../src/theme';

export default function EditarPerfil() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);
  const updateProfile = useAuthStore((state) => state.updateProfile);

  const [ownerName, setOwnerName] = useState(profile?.owner_name ?? '');
  const [petName, setPetName] = useState(profile?.pet_name ?? '');
  const [petBreed, setPetBreed] = useState(profile?.pet_breed ?? '');
  const [petAge, setPetAge] = useState(profile?.pet_age ? String(profile.pet_age) : '');
  const [neighborhood, setNeighborhood] = useState(profile?.neighborhood ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickAvatar = async () => {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Necesitamos acceso a tus fotos para cambiar el avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !session) return;

    setUploadingAvatar(true);
    try {
      const asset = result.assets[0];
      const fileBytes = await new File(asset.uri).arrayBuffer();
      const path = `${session.user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, fileBytes, { contentType: 'image/jpeg', upsert: true });
      if (uploadError) {
        setError('No pudimos subir la foto. Probá de nuevo.');
        return;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    if (!ownerName || !petName) {
      setError('El nombre tuyo y el de tu perro no pueden estar vacíos.');
      return;
    }

    const parsedAge = petAge ? Number(petAge) : null;
    if (petAge && (Number.isNaN(parsedAge) || parsedAge! < 0 || parsedAge! > 30)) {
      setError('Ingresá una edad válida para tu perro.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await updateProfile({
      owner_name: ownerName.trim(),
      pet_name: petName.trim(),
      pet_breed: petBreed.trim(),
      pet_age: parsedAge,
      neighborhood: neighborhood.trim(),
      avatar_url: avatarUrl,
    });
    setSaving(false);

    if (updateError) {
      setError(updateError);
      return;
    }
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textOnDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Editar perfil</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.avatarWrap} onPress={pickAvatar} disabled={uploadingAvatar}>
            <Avatar uri={avatarUrl} size={96} />
            <View style={styles.avatarEditBadge}>
              {uploadingAvatar ? (
                <ActivityIndicator size="small" color={colors.azulVereda} />
              ) : (
                <Ionicons name="camera" size={16} color={colors.azulVereda} />
              )}
            </View>
          </Pressable>
          <Text style={styles.avatarHint}>Tocá la foto para cambiarla</Text>

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
              label="Raza"
              placeholder="Mestiza, Labrador, ..."
              value={petBreed}
              onChangeText={setPetBreed}
              autoCapitalize="words"
            />
            <TextField
              label="Edad de tu perro"
              placeholder="Años"
              value={petAge}
              onChangeText={setPetAge}
              keyboardType="number-pad"
            />
            <TextField
              label="Barrio"
              placeholder="Colegiales"
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>

          <Button label="Guardar cambios" loading={saving} onPress={handleSave} />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textOnDark,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.verdeHuella,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.azulVereda,
  },
  avatarHint: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textOnDarkMuted,
    marginTop: -spacing.md,
  },
  form: {
    width: '100%',
    gap: spacing.lg,
  },
  errorText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: '#E38585',
    textAlign: 'center',
  },
});
