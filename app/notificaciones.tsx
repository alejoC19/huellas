import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../src/components/Avatar';
import { supabase } from '../src/lib/supabase';
import { useAuthStore } from '../src/store/useAuthStore';
import { colors, fonts, fontSizes, spacing } from '../src/theme';
import { timeAgo } from '../src/utils/time';

type NotificationItem = {
  id: string;
  type: string;
  createdAt: string;
  readAt: string | null;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  placeName: string | null;
};

type NotificationRow = {
  id: string;
  type: string;
  created_at: string;
  read_at: string | null;
  actor_id: string;
  profiles: { pet_name: string; avatar_url: string | null } | null;
  posts: { places: { name: string } | null } | null;
};

export default function Notificaciones() {
  const session = useAuthStore((state) => state.session);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('notifications')
      .select(
        'id, type, created_at, read_at, actor_id, profiles!notifications_actor_id_fkey(pet_name, avatar_url), posts(places(name))'
      )
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    const rows = (data ?? []) as unknown as NotificationRow[];
    setItems(
      rows.map((row) => ({
        id: row.id,
        type: row.type,
        createdAt: row.created_at,
        readAt: row.read_at,
        actorId: row.actor_id,
        actorName: row.profiles?.pet_name || 'Alguien',
        actorAvatarUrl: row.profiles?.avatar_url ?? null,
        placeName: row.posts?.places?.name ?? null,
      }))
    );
    setLoading(false);

    const unreadIds = rows.filter((row) => !row.read_at).map((row) => row.id);
    if (unreadIds.length > 0) {
      await supabase.from('notifications').update({ read_at: new Date().toISOString() }).in('id', unreadIds);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  const messageFor = (item: NotificationItem) => {
    if (item.type === 'follow') return 'empezó a seguirte';
    if (item.type === 'like') {
      return item.placeName ? `le gustó tu huella en ${item.placeName}` : 'le gustó tu huella';
    }
    return 'tuvo actividad en tu perfil';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.verdeParque} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Notificaciones</Text>
          <View style={styles.iconButton} />
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="notifications-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                Todavía no tenés notificaciones. Cuando alguien te siga o le dé like a una huella tuya,
                aparece acá.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[styles.row, !item.readAt && styles.rowUnread]}
              onPress={() => router.push(`/usuario/${item.actorId}`)}
            >
              <Avatar uri={item.actorAvatarUrl} size={40} background={colors.cremaBase} pawColor={colors.azulVereda} />
              <View style={styles.rowText}>
                <Text style={styles.rowMessage}>
                  <Text style={styles.rowActor}>{item.actorName}</Text> {messageFor(item)}
                </Text>
                <Text style={styles.rowTime}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.readAt && <View style={styles.unreadDot} />}
            </Pressable>
          )}
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
  safeArea: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cremaBase,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
  },
  rowUnread: {
    backgroundColor: colors.amarilloSolera,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowMessage: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  rowActor: {
    fontFamily: fonts.textSemiBold,
  },
  rowTime: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.verdeParque,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
