import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { LevelSteps } from '../../src/components/LevelBar';
import { PawIcon } from '../../src/components/PawIcon';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { getLevelInfo, LEVELS } from '../../src/utils/levels';
import { formatDueDate } from '../../src/utils/time';

type Tab = 'recorridos' | 'insignias' | 'favoritos' | 'agenda';

type PlaceVisit = {
  placeId: string;
  placeName: string;
  neighborhood: string;
  count: number;
};

type CheckinRow = {
  id: string;
  places: { id: string; name: string; neighborhood: string } | null;
};

type FavoritePlace = {
  placeId: string;
  placeName: string;
  neighborhood: string;
};

type FavoriteRow = {
  places: { id: string; name: string; neighborhood: string } | null;
};

type AgendaItem = {
  id: string;
  title: string;
  notes: string;
  dueDate: string;
  done: boolean;
  placeName: string | null;
};

type AgendaRow = {
  id: string;
  title: string;
  notes: string;
  due_date: string;
  done: boolean;
  places: { name: string } | null;
};

export default function Perfil() {
  const profile = useAuthStore((state) => state.profile);
  const session = useAuthStore((state) => state.session);
  const signOut = useAuthStore((state) => state.signOut);
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const [tab, setTab] = useState<Tab>('recorridos');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ huellas: 0, barrios: 0, lugares: 0 });
  const [visits, setVisits] = useState<PlaceVisit[]>([]);
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);

  const loadFavorites = useCallback(async () => {
    if (!session) return;

    const { data } = await supabase
      .from('favorites')
      .select('places(id, name, neighborhood)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    const rows = (data ?? []) as unknown as FavoriteRow[];
    setFavorites(
      rows
        .filter((row) => row.places)
        .map((row) => ({
          placeId: row.places!.id,
          placeName: row.places!.name,
          neighborhood: row.places!.neighborhood,
        }))
    );
  }, [session]);

  const loadVisits = useCallback(async () => {
    if (!session) return;

    const { data } = await supabase
      .from('checkins')
      .select('id, places(id, name, neighborhood)')
      .eq('user_id', session.user.id);

    const rows = (data ?? []) as unknown as CheckinRow[];
    const neighborhoods = new Set<string>();
    const placesById = new Map<string, PlaceVisit>();

    rows.forEach((row) => {
      if (!row.places) return;
      neighborhoods.add(row.places.neighborhood);
      const existing = placesById.get(row.places.id);
      if (existing) {
        existing.count += 1;
      } else {
        placesById.set(row.places.id, {
          placeId: row.places.id,
          placeName: row.places.name,
          neighborhood: row.places.neighborhood,
          count: 1,
        });
      }
    });

    setStats({ huellas: rows.length, barrios: neighborhoods.size, lugares: placesById.size });
    setVisits(Array.from(placesById.values()).sort((a, b) => b.count - a.count));
  }, [session]);

  const loadAgenda = useCallback(async () => {
    if (!session) return;

    const { data } = await supabase
      .from('agenda_items')
      .select('id, title, notes, due_date, done, places(name)')
      .eq('user_id', session.user.id)
      .order('due_date', { ascending: true });

    const rows = (data ?? []) as unknown as AgendaRow[];
    setAgenda(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        notes: row.notes,
        dueDate: row.due_date,
        done: row.done,
        placeName: row.places?.name ?? null,
      }))
    );
  }, [session]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([loadVisits(), loadFavorites(), loadAgenda()]).finally(() => setLoading(false));
  }, [session, loadVisits, loadFavorites, loadAgenda]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadVisits(), loadFavorites(), loadAgenda(), refreshProfile()]);
    setRefreshing(false);
  }, [loadVisits, loadFavorites, loadAgenda, refreshProfile]);

  const toggleAgendaDone = async (item: AgendaItem) => {
    const nextDone = !item.done;
    setAgenda((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: nextDone } : i)));
    const { error } = await supabase.from('agenda_items').update({ done: nextDone }).eq('id', item.id);
    if (error) {
      setAgenda((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: item.done } : i)));
    }
  };

  const deleteAgendaItem = async (id: string) => {
    const previous = agenda;
    setAgenda((prev) => prev.filter((i) => i.id !== id));
    const { error } = await supabase.from('agenda_items').delete().eq('id', id);
    if (error) setAgenda(previous);
  };

  const points = profile?.points ?? 0;
  const { level, nextLevel, pointsToNext } = getLevelInfo(points);
  const petName = profile?.pet_name || 'Tu perro';
  const breedAge = [profile?.pet_breed, profile?.pet_age ? `${profile.pet_age} años` : null]
    .filter(Boolean)
    .join(' · ');
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
          <View style={styles.headerRow}>
            <View style={{ width: 22 }} />
            <Text style={styles.headerTitle}>Perfil</Text>
            <Pressable onPress={signOut} hitSlop={8}>
              <Ionicons name="log-out-outline" size={22} color={colors.textOnDark} />
            </Pressable>
          </View>

          <View style={styles.avatarBlock}>
            <Pressable style={styles.avatarWrap} onPress={() => router.push('/perfil/editar')}>
              <Avatar uri={profile?.avatar_url} size={80} pawColor={colors.cremaBase} />
              <View style={styles.avatarEditBadge}>
                <Ionicons name="pencil" size={12} color={colors.azulVereda} />
              </View>
            </Pressable>
            <Text style={styles.petName}>{petName}</Text>
            <Text style={styles.petMeta}>
              {breedAge ? `${breedAge} · ` : ''}
              {neighborhood}
            </Text>
            <View style={styles.badgeRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{level.name}</Text>
              </View>
              <Text style={styles.levelPoints}>{points} pts</Text>
            </View>
          </View>

          <View style={styles.levelStepsWrap}>
            <LevelSteps points={points} />
          </View>

          <Card style={styles.contentCard}>
            <View style={styles.statsRow}>
              <StatTile label="huellas" value={stats.huellas} />
              <StatTile label="barrios" value={stats.barrios} />
              <StatTile label="lugares" value={stats.lugares} />
            </View>

            <View style={styles.tabsRow}>
              <TabButton
                label="Recorridos"
                active={tab === 'recorridos'}
                onPress={() => setTab('recorridos')}
              />
              <TabButton
                label="Insignias"
                active={tab === 'insignias'}
                onPress={() => setTab('insignias')}
              />
              <TabButton
                label="Favoritos"
                active={tab === 'favoritos'}
                onPress={() => setTab('favoritos')}
              />
              <TabButton label="Agenda" active={tab === 'agenda'} onPress={() => setTab('agenda')} />
            </View>

            {tab === 'recorridos' &&
              (loading ? null : visits.length === 0 ? (
                <EmptyTab text="Todavía no dejaste huellas. ¡Arrancá en el mapa!" />
              ) : (
                <View style={styles.list}>
                  {visits.map((visit) => (
                    <View key={visit.placeId} style={styles.visitRow}>
                      <View style={styles.visitIcon}>
                        <PawIcon size={16} color={colors.verdeParque} />
                      </View>
                      <View style={styles.visitInfo}>
                        <Text style={styles.visitName}>{visit.placeName}</Text>
                        <Text style={styles.visitMeta}>{visit.neighborhood}</Text>
                      </View>
                      <Text style={styles.visitCount}>
                        {visit.count} {visit.count === 1 ? 'vez' : 'veces'}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}

            {tab === 'insignias' && (
              <View style={styles.badgesGrid}>
                {LEVELS.map((lvl) => {
                  const unlocked = points >= lvl.min;
                  return (
                    <View key={lvl.name} style={[styles.badgeTile, !unlocked && styles.badgeTileLocked]}>
                      <PawIcon size={22} color={unlocked ? colors.verdeHuella : colors.border} />
                      <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]}>
                        {lvl.name}
                      </Text>
                      <Text style={styles.badgeThreshold}>{lvl.min}+ pts</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {tab === 'favoritos' &&
              (loading ? null : favorites.length === 0 ? (
                <EmptyTab text="Todavía no marcaste lugares favoritos. ¡Tocá el corazón en un lugar!" />
              ) : (
                <View style={styles.list}>
                  {favorites.map((favorite) => (
                    <Pressable
                      key={favorite.placeId}
                      style={styles.visitRow}
                      onPress={() => router.push(`/lugar/${favorite.placeId}`)}
                    >
                      <View style={styles.visitIcon}>
                        <Ionicons name="heart" size={16} color="#E38585" />
                      </View>
                      <View style={styles.visitInfo}>
                        <Text style={styles.visitName}>{favorite.placeName}</Text>
                        <Text style={styles.visitMeta}>{favorite.neighborhood}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                    </Pressable>
                  ))}
                </View>
              ))}

            {tab === 'agenda' && (
              <View style={styles.list}>
                {!loading && agenda.length === 0 && (
                  <EmptyTab text="No tenés recordatorios. Agregá turnos, vacunas o lo que necesites no olvidar." />
                )}
                {agenda.map((item) => (
                  <View key={item.id} style={styles.agendaRow}>
                    <Pressable
                      style={[styles.agendaCheck, item.done && styles.agendaCheckDone]}
                      onPress={() => toggleAgendaDone(item)}
                      hitSlop={8}
                    >
                      {item.done && <Ionicons name="checkmark" size={14} color={colors.white} />}
                    </Pressable>
                    <View style={styles.visitInfo}>
                      <Text style={[styles.visitName, item.done && styles.agendaTitleDone]}>
                        {item.title}
                      </Text>
                      <Text style={styles.visitMeta}>
                        {formatDueDate(item.dueDate)}
                        {item.placeName ? ` · ${item.placeName}` : ''}
                      </Text>
                    </View>
                    <Pressable onPress={() => deleteAgendaItem(item.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                    </Pressable>
                  </View>
                ))}
                <Pressable style={styles.addAgendaButton} onPress={() => router.push('/agenda/nuevo')}>
                  <Ionicons name="add" size={16} color={colors.verdeParque} />
                  <Text style={styles.addAgendaButtonText}>Agregar recordatorio</Text>
                </Pressable>
              </View>
            )}

            {nextLevel && (
              <View style={styles.nextLevelCard}>
                <PawIcon size={20} color={colors.verdeParque} />
                <Text style={styles.nextLevelText}>
                  {pointsToNext} pts para ser {nextLevel.name}
                </Text>
              </View>
            )}

            <Button
              label="Ver beneficios"
              variant="ghost"
              onPress={() => router.push('/beneficios')}
              style={styles.benefitsButton}
            />
            <Button
              label="Historial de puntos"
              variant="ghost"
              onPress={() => router.push('/perfil/puntos')}
              style={styles.benefitsButton}
            />
            <Button
              label="Mis canjes"
              variant="ghost"
              onPress={() => router.push('/perfil/canjes')}
              style={styles.benefitsButton}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statTile}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function EmptyTab({ text }: { text: string }) {
  return (
    <View style={styles.emptyTab}>
      <PawIcon size={24} color={colors.verdeParque} />
      <Text style={styles.emptyTabText}>{text}</Text>
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
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
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
  avatarBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarEditBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.verdeHuella,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.azulVereda,
  },
  petName: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textOnDark,
    marginTop: spacing.sm,
  },
  petMeta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
  levelPoints: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  levelStepsWrap: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  contentCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    gap: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.cremaBase,
    borderRadius: radii.pill,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  tabButtonActive: {
    backgroundColor: colors.azulVereda,
  },
  tabButtonText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.textOnDark,
  },
  list: {
    gap: spacing.md,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  visitIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cremaBase,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitInfo: {
    flex: 1,
    gap: 1,
  },
  visitName: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  visitMeta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  visitCount: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  agendaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  agendaCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.verdeParque,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agendaCheckDone: {
    backgroundColor: colors.verdeParque,
  },
  agendaTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  addAgendaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  addAgendaButtonText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.verdeParque,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  badgeTile: {
    flexBasis: '47%',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cremaBase,
    borderRadius: radii.md,
    paddingVertical: spacing.lg,
  },
  badgeTileLocked: {
    opacity: 0.5,
  },
  badgeLabel: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  badgeLabelLocked: {
    color: colors.textMuted,
  },
  badgeThreshold: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  emptyTab: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyTabText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  nextLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cremaBase,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  nextLevelText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  benefitsButton: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
