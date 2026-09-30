import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../../src/components/Avatar';
import { FeedPost, PostCard } from '../../src/components/PostCard';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { getLevelInfo } from '../../src/utils/levels';
import { timeAgo } from '../../src/utils/time';

type PublicProfile = {
  id: string;
  petName: string;
  ownerName: string;
  petBreed: string;
  neighborhood: string;
  avatarUrl: string | null;
  points: number;
};

type PostRow = {
  id: string;
  user_id: string;
  created_at: string;
  text: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  checkin_id: string | null;
  places: { name: string; neighborhood: string } | null;
};

export default function PerfilPublico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = useAuthStore((state) => state.session);
  const isOwn = session?.user.id === id;

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [stats, setStats] = useState({ huellas: 0, lugares: 0, reseñas: 0 });
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [togglingFollow, setTogglingFollow] = useState(false);

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    (async () => {
      setLoading(true);
      const [{ data: profileRow }, { data: checkinRows }, { data: reviewRows }, { data: postRows }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('id, pet_name, owner_name, pet_breed, neighborhood, avatar_url, points')
            .eq('id', id)
            .single(),
          supabase.from('checkins').select('place_id').eq('user_id', id),
          supabase.from('reviews').select('id').eq('user_id', id),
          supabase
            .from('posts')
            .select(
              'id, user_id, created_at, text, image_url, likes_count, comments_count, checkin_id, places(name, neighborhood)'
            )
            .eq('user_id', id)
            .order('created_at', { ascending: false })
            .limit(20),
        ]);

      if (!mounted) return;

      if (profileRow) {
        setProfile({
          id: profileRow.id,
          petName: profileRow.pet_name,
          ownerName: profileRow.owner_name,
          petBreed: profileRow.pet_breed,
          neighborhood: profileRow.neighborhood,
          avatarUrl: profileRow.avatar_url,
          points: profileRow.points,
        });
      }

      const distinctPlaces = new Set((checkinRows ?? []).map((row) => row.place_id));
      setStats({
        huellas: checkinRows?.length ?? 0,
        lugares: distinctPlaces.size,
        reseñas: reviewRows?.length ?? 0,
      });

      const rows = (postRows ?? []) as unknown as PostRow[];
      setPosts(
        rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          createdAt: row.created_at,
          text: row.text ?? '',
          imageUrl: row.image_url,
          likesCount: row.likes_count,
          commentsCount: row.comments_count,
          earnedCheckinPoints: Boolean(row.checkin_id),
          petName: profileRow?.pet_name || 'Alguien',
          petAvatarUrl: profileRow?.avatar_url ?? null,
          placeName: row.places?.name || 'un lugar',
          placeNeighborhood: row.places?.neighborhood || '',
        }))
      );

      if (session && !isOwn) {
        const { data: followRow } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', session.user.id)
          .eq('following_id', id)
          .maybeSingle();
        if (mounted) setFollowing(Boolean(followRow));

        const { data: likeRows } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', session.user.id);
        if (mounted) setLikedIds(new Set((likeRows ?? []).map((row) => row.post_id)));
      }

      setLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, [id, session, isOwn]);

  const levelInfo = useMemo(() => (profile ? getLevelInfo(profile.points) : null), [profile]);

  const toggleFollow = async () => {
    if (!session || !id || togglingFollow) return;
    setTogglingFollow(true);
    const next = !following;
    setFollowing(next);
    try {
      if (next) {
        await supabase.from('follows').insert({ follower_id: session.user.id, following_id: id });
      } else {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', id);
      }
    } finally {
      setTogglingFollow(false);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!session) return;
    const isLiked = likedIds.has(postId);
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likesCount: Math.max(0, post.likesCount + (isLiked ? -1 : 1)) }
          : post
      )
    );
    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', session.user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: session.user.id });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.verdeParque} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No encontramos este perfil.</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Volver</Text>
        </Pressable>
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
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.profileHeader}>
              <Avatar uri={profile.avatarUrl} size={72} background={colors.verdeHuella} pawColor={colors.azulVereda} />
              <Text style={styles.petName}>{profile.petName}</Text>
              <Text style={styles.subtitle}>
                {profile.ownerName} · {profile.petBreed || 'Sin raza'} · {profile.neighborhood}
              </Text>

              {levelInfo && (
                <View style={styles.levelPill}>
                  <Text style={styles.levelPillText}>
                    {levelInfo.level.name} · {profile.points} pts
                  </Text>
                </View>
              )}

              {!isOwn && session && (
                <Pressable
                  style={[styles.followButton, following && styles.followButtonActive]}
                  onPress={toggleFollow}
                  disabled={togglingFollow}
                >
                  <Text style={[styles.followButtonText, following && styles.followButtonTextActive]}>
                    {following ? 'Siguiendo' : 'Seguir'}
                  </Text>
                </Pressable>
              )}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.huellas}</Text>
                  <Text style={styles.statLabel}>Huellas</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.lugares}</Text>
                  <Text style={styles.statLabel}>Lugares</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.reseñas}</Text>
                  <Text style={styles.statLabel}>Reseñas</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Huellas recientes</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Todavía no dejó ninguna huella.</Text>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              liked={likedIds.has(item.id)}
              timeLabel={timeAgo(item.createdAt)}
              onToggleLike={() => toggleLike(item.id)}
              onViewComments={() => router.push(`/comentarios/${item.id}`)}
              isOwnPost={isOwn}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
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
    gap: spacing.md,
    backgroundColor: colors.cremaBase,
  },
  headerRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  profileHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  petName: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  levelPill: {
    backgroundColor: colors.cremaBase,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginTop: spacing.sm,
  },
  levelPillText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.verdeParque,
  },
  followButton: {
    marginTop: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.verdeParque,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  followButtonActive: {
    backgroundColor: colors.cremaBase,
    borderColor: colors.border,
  },
  followButtonText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.verdeParque,
  },
  followButtonTextActive: {
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xxl,
    marginTop: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.lg,
    color: colors.textPrimary,
  },
  statLabel: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginTop: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  backLink: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.verdeParque,
  },
});
