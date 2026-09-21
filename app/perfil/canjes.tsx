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

type RedemptionRow = {
  id: string;
  points_spent: number;
  created_at: string;
  benefits: { title: string; place_name: string; neighborhood: string } | null;
};

export default function RedemptionsHistory() {
  const session = useAuthStore((state) => state.session);

  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRedemptions = useCallback(async () => {
    if (!session) return;
    const { data } = await supabase
      .from('redemptions')
      .select('id, points_spent, created_at, benefits(title, place_name, neighborhood)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(100);
    setRedemptions((data ?? []) as unknown as RedemptionRow[]);
  }, [session]);

  useEffect(() => {
    loadRedemptions().finally(() => setLoading(false));
  }, [loadRedemptions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRedemptions();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Mis canjes</Text>
          <View style={{ width: 22 }} />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.verdeParque} />
        ) : (
          <FlatList
            data={redemptions}
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
                  Todavía no canjeaste ningún beneficio. ¡Sumá puntos y date un gusto!
                </Text>
              </Card>
            }
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.iconBadge}>
                  <Ionicons name="gift" size={16} color={colors.azulVereda} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.rowTitle}>{item.benefits?.title ?? 'Beneficio'}</Text>
                  <Text style={styles.rowMeta}>
                    {item.benefits?.place_name ? `${item.benefits.place_name} · ` : ''}
                    {timeAgo(item.created_at)}
                  </Text>
                </View>
                <Text style={styles.rowPoints}>-{item.points_spent}</Text>
              </View>
            )}
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
    backgroundColor: colors.verdeHuella,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textMuted,
  },
});
