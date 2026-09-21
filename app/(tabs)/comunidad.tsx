import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../../src/components/Card';
import { Chip } from '../../src/components/Chip';
import { PawIcon } from '../../src/components/PawIcon';
import { FeedPost, PostCard } from '../../src/components/PostCard';
import { getMockPlaceIdByName } from '../../src/data/places';
import { supabase } from '../../src/lib/supabase';
import { useAuthStore } from '../../src/store/useAuthStore';
import { colors, fonts, fontSizes, radii, spacing } from '../../src/theme';
import { haversineDistanceMeters } from '../../src/utils/geo';
import { timeAgo } from '../../src/utils/time';

type FeedFilter = 'cerca' | 'siguiendo' | 'colegiales' | null;

type FeedPostWithGeo = FeedPost & { placeLat: number | null; placeLng: number | null };

type PostRow = {
  id: string;
  created_at: string;
  text: string | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  checkin_id: string | null;
  profiles: { pet_name: string } | null;
  places: { name: string; neighborhood: string; latitude: number; longitude: number } | null;
};

export default function Comunidad() {
  const session = useAuthStore((state) => state.session);

  const [posts, setPosts] = useState<FeedPostWithGeo[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FeedFilter>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('posts')
        .select(
          'id, created_at, text, image_url, likes_count, comments_count, checkin_id, profiles(pet_name), places(name, neighborhood, latitude, longitude)'
        )
        .order('created_at', { ascending: false })
        .limit(30);

      const rows = (data ?? []) as unknown as PostRow[];
      setPosts(
        rows.map((row) => ({
          id: row.id,
          createdAt: row.created_at,
          text: row.text ?? '',
          imageUrl: row.image_url,
          likesCount: row.likes_count,
          commentsCount: row.comments_count,
          earnedCheckinPoints: Boolean(row.checkin_id),
          petName: row.profiles?.pet_name || 'Alguien',
          placeName: row.places?.name || 'un lugar',
          placeNeighborhood: row.places?.neighborhood || '',
          placeLat: row.places?.latitude ?? null,
          placeLng: row.places?.longitude ?? null,
        }))
      );

      if (session) {
        const { data: likes } = await supabase
          .from('post_likes')
          .select('post_id')
          .eq('user_id', session.user.id);
        setLikedIds(new Set((likes ?? []).map((row) => row.post_id)));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const position = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
    })();
  }, []);

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

  const visiblePosts = useMemo(() => {
    if (filter === 'siguiendo') return [];

    let list = posts;
    if (filter === 'colegiales') {
      list = list.filter((post) => post.placeNeighborhood === 'Colegiales');
    }
    if (filter === 'cerca' && userLocation) {
      list = [...list].sort((a, b) => {
        const distA =
          a.placeLat != null && a.placeLng != null
            ? haversineDistanceMeters(userLocation.lat, userLocation.lng, a.placeLat, a.placeLng)
            : Infinity;
        const distB =
          b.placeLat != null && b.placeLng != null
            ? haversineDistanceMeters(userLocation.lat, userLocation.lng, b.placeLat, b.placeLng)
            : Infinity;
        return distA - distB;
      });
    }
    return list;
  }, [posts, filter, userLocation]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Comunidad</Text>
          <Text style={styles.subtitle}>Lo que anduvo cerca tuyo hoy</Text>
        </View>

        <View style={styles.chipsRow}>
          <Chip
            label="Cerca mío"
            active={filter === 'cerca'}
            onPress={() => setFilter(filter === 'cerca' ? null : 'cerca')}
          />
          <Chip
            label="Siguiendo"
            active={filter === 'siguiendo'}
            onPress={() => setFilter(filter === 'siguiendo' ? null : 'siguiendo')}
          />
          <Chip
            label="Colegiales"
            active={filter === 'colegiales'}
            onPress={() => setFilter(filter === 'colegiales' ? null : 'colegiales')}
          />
        </View>

        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.verdeParque} />
        ) : filter === 'siguiendo' ? (
          <Card style={styles.emptyCard}>
            <PawIcon size={28} color={colors.verdeParque} />
            <Text style={styles.emptyText}>
              Todavía no seguís a nadie. Esta función está en construcción.
            </Text>
          </Card>
        ) : visiblePosts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <PawIcon size={28} color={colors.verdeParque} />
            <Text style={styles.emptyText}>
              Todavía no hay huellas en la comunidad. ¡Dejá la primera!
            </Text>
          </Card>
        ) : (
          <FlatList
            data={visiblePosts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.feedContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                liked={likedIds.has(item.id)}
                timeLabel={timeAgo(item.createdAt)}
                onToggleLike={() => toggleLike(item.id)}
                onViewPlace={() => {
                  const mockId = getMockPlaceIdByName(item.placeName);
                  if (mockId) router.push(`/lugar/${mockId}`);
                }}
              />
            )}
          />
        )}
      </SafeAreaView>

      <Pressable style={styles.fab} onPress={() => router.push('/(tabs)/cerca')}>
        <Ionicons name="add" size={18} color={colors.azulVereda} />
        <Text style={styles.fabText}>Dejar mi huella</Text>
      </Pressable>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontFamily: fonts.displayExtraBold,
    fontSize: fontSizes.xl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  loader: {
    marginTop: spacing.xxxl,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
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
  feedContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.xxl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: colors.azulVereda,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fabText: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.sm,
    color: colors.azulVereda,
  },
});
