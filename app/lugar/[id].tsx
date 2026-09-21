import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { PawIcon } from '../../src/components/PawIcon';
import { StarRating } from '../../src/components/StarRating';
import { Place } from '../../src/data/places';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { timeAgo } from '../../src/utils/time';

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

type RecentCheckin = {
  id: string;
  createdAt: string;
  petName: string;
};

export default function LugarDetalle() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((state) => state.session);
  const [place, setPlace] = useState<Place | null>(null);
  const [recent, setRecent] = useState<RecentCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorite, setFavorite] = useState(false);
  const [togglingFavorite, setTogglingFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const [{ data: placeRow }, { data: statsRow }, { data: checkinRows }] = await Promise.all([
          supabase
            .from('places')
            .select('id, name, category, neighborhood, address, latitude, longitude, tags')
            .eq('id', id)
            .single(),
          supabase.from('place_stats').select('checkin_count, avg_rating').eq('place_id', id).single(),
          supabase
            .from('checkins')
            .select('id, created_at, profiles(pet_name)')
            .eq('place_id', id)
            .order('created_at', { ascending: false })
            .limit(4),
        ]);

        if (session) {
          const { data: favoriteRow } = await supabase
            .from('favorites')
            .select('place_id')
            .eq('place_id', id)
            .eq('user_id', session.user.id)
            .maybeSingle();
          if (mounted) setFavorite(Boolean(favoriteRow));
        }

        if (!mounted) return;

        if (placeRow) {
          setPlace({
            id: placeRow.id,
            name: placeRow.name,
            category: placeRow.category as Place['category'],
            neighborhood: placeRow.neighborhood,
            address: placeRow.address,
            latitude: placeRow.latitude,
            longitude: placeRow.longitude,
            tags: placeRow.tags,
            rating: statsRow?.avg_rating ? Number(statsRow.avg_rating) : 0,
            reviewCount: statsRow?.checkin_count ?? 0,
            distanceLabel: '',
          });
        }

        const rows = (checkinRows ?? []) as unknown as Array<{
          id: string;
          created_at: string;
          profiles: { pet_name: string } | null;
        }>;
        setRecent(
          rows.map((row) => ({
            id: row.id,
            createdAt: row.created_at,
            petName: row.profiles?.pet_name || 'Alguien',
          }))
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, session]);

  const toggleFavorite = async () => {
    if (!session || !place || togglingFavorite) return;
    setTogglingFavorite(true);
    const next = !favorite;
    setFavorite(next);
    try {
      if (next) {
        await supabase.from('favorites').insert({ place_id: place.id, user_id: session.user.id });
      } else {
        await supabase
          .from('favorites')
          .delete()
          .eq('place_id', place.id)
          .eq('user_id', session.user.id);
      }
    } finally {
      setTogglingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.notFound}>
        <ActivityIndicator color={colors.verdeParque} />
      </View>
    );
  }

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
            <Pressable style={styles.iconButton} onPress={toggleFavorite} disabled={togglingFavorite}>
              <Ionicons
                name={favorite ? 'heart' : 'heart-outline'}
                size={20}
                color={favorite ? '#E38585' : colors.textOnDark}
              />
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
            {place.rating > 0 ? `${place.rating.toFixed(1)} · ` : ''}
            {place.reviewCount} huellas
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
            <Text style={styles.featureText}>Verificado por {place.reviewCount} vecinos</Text>
          </View>
        </View>
      </Card>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Últimas huellas</Text>

          {recent.length === 0 ? (
            <Text style={styles.emptyText}>Todavía nadie dejó una huella acá. ¡Sé el primero!</Text>
          ) : (
            recent.map((item) => (
              <View key={item.id} style={styles.activityRow}>
                <View style={styles.activityAvatar}>
                  <PawIcon size={18} color={colors.azulVereda} />
                </View>
                <Text style={styles.activityText}>
                  <Text style={styles.activityName}>{item.petName} </Text>
                  dejó una huella {timeAgo(item.createdAt)}
                </Text>
              </View>
            ))
          )}
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
  emptyText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
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
