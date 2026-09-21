import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../src/components/Card';
import { PawIcon } from '../../src/components/PawIcon';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { timeAgo } from '../../src/utils/time';

type Reason = 'checkin' | 'review' | 'qr' | 'redeem';

const REASON_LABEL: Record<Reason, string> = {
  checkin: 'Check-in con foto',
  review: 'Reseña verificada',
  qr: 'Huella QR escondida',
  redeem: 'Canje de beneficio',
};

const REASON_ICON: Record<Reason, keyof typeof Ionicons.glyphMap> = {
  checkin: 'camera',
  review: 'star',
  qr: 'qr-code',
  redeem: 'gift',
};

type PointsEventRow = {
  id: string;
  reason: Reason;
  points: number;
  created_at: string;
  places: { name: string } | null;
};

export default function PointsHistory() {
  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  const [events, setEvents] = useState<PointsEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('points_events')
      .select('id, reason, points, created_at, places(name)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setEvents((data ?? []) as unknown as PointsEventRow[]);
  }, [session]);

  useEffect(() => {
    loadEvents().finally(() => setLoading(false));
  }, [loadEvents]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Historial de puntos</Text>
          <View style={{ width: 22 }} />
        </View>

        <Card variant="dark" style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Tenés</Text>
          <Text style={styles.pointsValue}>{profile?.points ?? 0} puntos</Text>
        </Card>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.verdeParque} />
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.verdeParque}
                colors={[colors.verdeParque]}
              />
            }
            ListEmptyComponent={
              <Card style={styles.emptyCard}>
                <PawIcon size={24} color={colors.verdeParque} />
                <Text style={styles.emptyText}>
                  Todavía no sumaste puntos. ¡Dejá tu primera huella en el mapa!
                </Text>
              </Card>
            }
            renderItem={({ item }) => {
              const positive = item.points >= 0;
              return (
                <View style={styles.row}>
                  <View style={[styles.iconBadge, positive ? styles.iconBadgePositive : styles.iconBadgeNegative]}>
                    <Ionicons
                      name={REASON_ICON[item.reason]}
                      size={16}
                      color={positive ? colors.azulVereda : colors.textOnDark}
                    />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowTitle}>{REASON_LABEL[item.reason]}</Text>
                    <Text style={styles.rowMeta}>
                      {item.places?.name ? `${item.places.name} · ` : ''}
                      {timeAgo(item.created_at)}
                    </Text>
                  </View>
                  <Text style={[styles.rowPoints, positive ? styles.rowPointsPositive : styles.rowPointsNegative]}>
                    {positive ? '+' : ''}
                    {item.points}
                  </Text>
                </View>
              );
            }}
          />
        )}
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
    color: colors.textPrimary,
  },
  pointsCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  pointsLabel: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  pointsValue: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xxl,
    color: colors.textOnDark,
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  emptyCard: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgePositive: {
    backgroundColor: colors.verdeHuella,
  },
  iconBadgeNegative: {
    backgroundColor: colors.azulVereda,
  },
  rowInfo: {
    flex: 1,
    gap: 1,
  },
  rowTitle: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  rowMeta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  rowPoints: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
  },
  rowPointsPositive: {
    color: colors.verdeParque,
  },
  rowPointsNegative: {
    color: colors.textMuted,
  },
});
