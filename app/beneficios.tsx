import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Benefit, BenefitCard } from '../src/components/BenefitCard';
import { Card } from '../src/components/Card';
import { Chip } from '../src/components/Chip';
import { PawIcon } from '../src/components/PawIcon';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../src/theme';

type Filter = 'todos' | 'alcance' | 'colegiales';

const WAYS_TO_EARN = [
  { points: 50, label: 'Check-in con foto', color: colors.verdeHuella },
  { points: 30, label: 'Reseña verificada', color: colors.verdeParque },
  { points: 75, label: 'Huella QR escondida', color: colors.amarilloSolera },
];

export default function Beneficios() {
  const profile = useAuthStore((state) => state.profile);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('todos');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const points = profile?.points ?? 0;

  const loadBenefits = async () => {
    try {
      const { data } = await supabase
        .from('benefits')
        .select('id, title, place_name, neighborhood, points_cost')
        .order('points_cost', { ascending: true });

      setBenefits(
        (data ?? []).map((row) => ({
          id: row.id,
          title: row.title,
          placeName: row.place_name,
          neighborhood: row.neighborhood,
          pointsCost: row.points_cost,
        }))
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBenefits();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([loadBenefits(), refreshProfile()]);
  };

  const visibleBenefits = useMemo(() => {
    if (filter === 'alcance') return benefits.filter((b) => b.pointsCost <= points);
    if (filter === 'colegiales') return benefits.filter((b) => b.neighborhood === 'Colegiales');
    return benefits;
  }, [benefits, filter, points]);

  const handleConfirm = async (benefit: Benefit) => {
    setSubmittingId(benefit.id);
    setFeedback(null);
    try {
      const { error } = await supabase.rpc('redeem_benefit', { benefit_id_input: benefit.id });
      if (error) {
        setFeedback({ type: 'error', text: error.message });
      } else {
        await refreshProfile();
        setFeedback({ type: 'success', text: `¡Canjeaste "${benefit.title}"! Mostrá esto en ${benefit.placeName}.` });
      }
    } finally {
      setSubmittingId(null);
      setConfirmingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Beneficios</Text>
          <View style={{ width: 22 }} />
        </View>

        <Card variant="dark" style={styles.pointsCard}>
          <Text style={styles.pointsLabel}>Tenés disponibles</Text>
          <Text style={styles.pointsValue}>{points} puntos</Text>
        </Card>

        <View style={styles.chipsRow}>
          <Chip label="Todos" active={filter === 'todos'} onPress={() => setFilter('todos')} />
          <Chip label="A mi alcance" active={filter === 'alcance'} onPress={() => setFilter('alcance')} />
          <Chip label="Colegiales" active={filter === 'colegiales'} onPress={() => setFilter('colegiales')} />
        </View>

        {feedback && (
          <View
            style={[
              styles.feedbackBanner,
              feedback.type === 'error' && styles.feedbackBannerError,
            ]}
          >
            <Text style={styles.feedbackText}>{feedback.text}</Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.verdeParque} />
        ) : (
          <FlatList
            data={visibleBenefits}
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
                <Text style={styles.emptyText}>No hay beneficios para este filtro.</Text>
              </Card>
            }
            renderItem={({ item }) => (
              <BenefitCard
                benefit={item}
                affordable={item.pointsCost <= points}
                confirming={confirmingId === item.id}
                submitting={submittingId === item.id}
                onPressRedeem={() => setConfirmingId(item.id)}
                onCancel={() => setConfirmingId(null)}
                onConfirm={() => handleConfirm(item)}
              />
            )}
            ListFooterComponent={
              <View style={styles.earnSection}>
                <Text style={styles.earnTitle}>Cómo sumar más rápido</Text>
                <View style={styles.earnRow}>
                  {WAYS_TO_EARN.map((way) => (
                    <View key={way.label} style={styles.earnTile}>
                      <View style={[styles.earnBadge, { backgroundColor: way.color }]}>
                        <Text style={styles.earnBadgeText}>+{way.points}</Text>
                      </View>
                      <Text style={styles.earnLabel}>{way.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            }
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
  header: {
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
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  feedbackBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  feedbackBannerError: {
    backgroundColor: '#F6D6D6',
  },
  feedbackText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.azulVereda,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
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
  earnSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  earnTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  earnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  earnTile: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  earnBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  earnBadgeText: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
  earnLabel: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
