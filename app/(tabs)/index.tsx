import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { Card } from '../../src/components/Card';
import { CategoryTile } from '../../src/components/CategoryTile';
import { LevelBar } from '../../src/components/LevelBar';
import { PawIcon } from '../../src/components/PawIcon';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { getLevelInfo } from '../../src/utils/levels';
import { timeAgo } from '../../src/utils/time';

type ActivityRow = {
  id: string;
  created_at: string;
  pet_name: string;
  place_name: string;
};

const CATEGORY_TILES = [
  {
    key: 'salud',
    label: 'Salud',
    description: 'Guardias 24hs y veterinarias',
    icon: 'medkit' as const,
    href: '/(tabs)/cerca?category=veterinaria' as const,
  },
  {
    key: 'cuidado',
    label: 'Cuidado',
    description: 'Paseadores y pet shops',
    icon: 'walk' as const,
    href: '/(tabs)/cerca' as const,
  },
  {
    key: 'comunidad',
    label: 'Comunidad',
    description: 'Parques y cafés pet friendly',
    icon: 'people' as const,
    href: '/(tabs)/cerca' as const,
  },
  {
    key: 'adopcion',
    label: 'Adopción',
    description: 'Refugios y tránsito',
    icon: 'home' as const,
    href: '/(tabs)/cerca' as const,
  },
];

export default function Home() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = useCallback(async () => {
    const { data } = await supabase
      .from('checkins')
      .select('id, created_at, profiles(pet_name), places(name)')
      .order('created_at', { ascending: false })
      .limit(3);

    const rows = (data ?? []) as unknown as Array<{
      id: string;
      created_at: string;
      profiles: { pet_name: string } | null;
      places: { name: string } | null;
    }>;
    setActivity(
      rows.map((row) => ({
        id: row.id,
        created_at: row.created_at,
        pet_name: row.profiles?.pet_name || 'Alguien',
        place_name: row.places?.name || 'un lugar cerca tuyo',
      }))
    );
  }, []);

  useEffect(() => {
    loadActivity().finally(() => setLoadingActivity(false));
  }, [loadActivity]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadActivity(), refreshProfile()]);
    setRefreshing(false);
  }, [loadActivity, refreshProfile]);

  const points = profile?.points ?? 0;
  const { level, levelIndex, nextLevel } = getLevelInfo(points);
  const petName = profile?.pet_name || 'tu perro';
  const ownerName = profile?.owner_name || '';
  const neighborhood = profile?.neighborhood || 'Buenos Aires';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.verdeParque}
              colors={[colors.verdeParque]}
            />
          }
        >
          <View style={styles.header}>
            <Pressable style={styles.headerLeft} onPress={() => router.push('/perfil/editar')}>
              <Avatar uri={profile?.avatar_url} size={44} />
              <View>
                <Text style={styles.greeting}>Hola{ownerName ? `, ${ownerName}` : ''}</Text>
                <Text style={styles.greetingSub}>
                  {petName} · {neighborhood}
                </Text>
              </View>
            </Pressable>
            <Pressable style={styles.bellButton}>
              <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            </Pressable>
          </View>

          <Card variant="dark" style={styles.levelCard}>
            <View style={styles.levelTopRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{level.name}</Text>
              </View>
              <Text style={styles.levelIndex}>Nivel {levelIndex + 1} de 4</Text>
              <Text style={styles.levelPoints}>{points} pts</Text>
            </View>
            <LevelBar points={points} />
          </Card>

          <Pressable style={styles.searchBar} onPress={() => router.push('/(tabs)/cerca')}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Buscar un lugar o un barrio</Text>
          </Pressable>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>¿Qué necesitás hoy?</Text>
            <View style={styles.grid}>
              {CATEGORY_TILES.map((tile) => (
                <CategoryTile
                  key={tile.key}
                  icon={tile.icon}
                  label={tile.label}
                  description={tile.description}
                  onPress={() => router.push(tile.href)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasando ahora</Text>

            {loadingActivity ? null : activity.length === 0 ? (
              <Card style={styles.emptyActivity}>
                <PawIcon size={28} color={colors.verdeParque} />
                <Text style={styles.emptyActivityText}>
                  Todavía no hay huellas cerca tuyo. ¡Sé el primero en dejar una!
                </Text>
              </Card>
            ) : (
              activity.map((item) => (
                <Card key={item.id} style={styles.activityCard}>
                  <View style={styles.activityAvatar}>
                    <PawIcon size={18} color={colors.azulVereda} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityText}>
                      <Text style={styles.activityName}>{item.pet_name}</Text> dejó una huella en{' '}
                      {item.place_name}
                    </Text>
                    <Text style={styles.activityTime}>{timeAgo(item.created_at)}</Text>
                  </View>
                </Card>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cremaBase,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  greeting: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  greetingSub: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelCard: {
    gap: spacing.md,
  },
  levelTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  levelBadgeText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
  levelIndex: {
    flex: 1,
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  levelPoints: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.lg,
    color: colors.textOnDark,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    height: 48,
  },
  searchPlaceholder: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  emptyActivity: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyActivityText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activityAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.cremaBase,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    gap: 2,
  },
  activityText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  activityName: {
    fontFamily: fonts.textSemiBold,
  },
  activityTime: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
});
