import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { PawIcon } from '../../src/components/PawIcon';
import { StarRating } from '../../src/components/StarRating';
import { getPlaceById } from '../../src/data/places';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';

const FEATURE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'Sin correa': 'paw',
  Bebedero: 'water',
  Terraza: 'sunny',
  'Pet friendly': 'heart',
  'Guardia 24hs': 'time',
  Vacunas: 'medkit',
  Urgencias: 'medical',
  Sombra: 'leaf',
  Peluquería: 'cut',
};

export default function LugarDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const place = getPlaceById(id ?? '');

  if (!place) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>No encontramos este lugar.</Text>
        <Button label="Volver" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerSafe}>
          <View style={styles.headerRow}>
            <Pressable style={styles.iconButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={22} color={colors.textOnDark} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="heart-outline" size={20} color={colors.textOnDark} />
            </Pressable>
          </View>
          <View style={styles.headerPaws}>
            <PawIcon size={26} color="rgba(255,255,255,0.18)" />
            <PawIcon size={20} color="rgba(255,255,255,0.14)" />
            <PawIcon size={30} color="rgba(255,255,255,0.1)" />
          </View>
        </SafeAreaView>
      </View>

      <Card style={styles.mainCard}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Pet friendly</Text>
        </View>

        <Text style={styles.name}>{place.name}</Text>
        <Text style={styles.address}>
          {place.neighborhood} · {place.address}
        </Text>

        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} size={16} />
          <Text style={styles.ratingText}>
            {place.rating.toFixed(1)} · {place.reviewCount} huellas
          </Text>
        </View>

        <View style={styles.featureList}>
          {place.tags.map((tag) => (
            <View key={tag} style={styles.featureRow}>
              <Ionicons name={FEATURE_ICONS[tag] ?? 'checkmark-circle'} size={18} color={colors.verdeParque} />
              <Text style={styles.featureText}>{tag}</Text>
            </View>
          ))}
          <View style={styles.featureRow}>
            <Ionicons name="shield-checkmark" size={18} color={colors.verdeParque} />
            <Text style={styles.featureText}>Verificado por {place.verifiedBy} vecinos</Text>
          </View>
        </View>
      </Card>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas huellas</Text>

          <View style={styles.activityRow}>
            <View style={styles.activityAvatar}>
              <PawIcon size={18} color={colors.azulVereda} />
            </View>
            <Text style={styles.activityText}>
              <Text style={styles.activityName}>Tita </Text>
              dejó una huella hace 2h
            </Text>
          </View>

          <View style={styles.activityRow}>
            <View style={styles.activityAvatar}>
              <PawIcon size={18} color={colors.azulVereda} />
            </View>
            <Text style={styles.activityText}>
              <Text style={styles.activityName}>Ramón </Text>
              recomendó este lugar
            </Text>
          </View>
        </View>
      </ScrollView>

      <SafeAreaView style={styles.footer} edges={['bottom']}>
        <Button
          label="Dejar mi huella"
          variant="primary"
          onPress={() => router.push(`/checkin/${place.id}`)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cremaBase,
  },
  header: {
    height: 200,
    backgroundColor: colors.verdeParque,
    overflow: 'hidden',
  },
  headerSafe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPaws: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  mainCard: {
    marginTop: -48,
    marginHorizontal: spacing.lg,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginBottom: spacing.md,
  },
  tagText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
  name: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xxl,
    color: colors.textPrimary,
  },
  address: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  ratingText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  featureList: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  section: {
    marginTop: spacing.xxl,
    marginHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cremaBase,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  activityName: {
    fontFamily: fonts.textSemiBold,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.cremaBase,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: colors.cremaBase,
  },
  notFoundText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
});
