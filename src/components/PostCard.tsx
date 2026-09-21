import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '../theme';
import { Avatar } from './Avatar';

export type FeedPost = {
  id: string;
  createdAt: string;
  text: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  earnedCheckinPoints: boolean;
  petName: string;
  petAvatarUrl: string | null;
  placeName: string;
  placeNeighborhood: string;
};

type Props = {
  post: FeedPost;
  liked: boolean;
  timeLabel: string;
  onToggleLike: () => void;
  onViewPlace?: () => void;
};

export function PostCard({ post, liked, timeLabel, onToggleLike, onViewPlace }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar uri={post.petAvatarUrl} size={36} background={colors.cremaBase} pawColor={colors.azulVereda} />
        <View style={styles.headerInfo}>
          <Text style={styles.petName}>{post.petName}</Text>
          <Text style={styles.meta}>
            {post.placeName} · {post.placeNeighborhood} · {timeLabel}
          </Text>
        </View>
        {post.earnedCheckinPoints && (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>+50</Text>
          </View>
        )}
      </View>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
      )}

      {post.text ? <Text style={styles.text}>{post.text}</Text> : null}

      <View style={styles.footer}>
        <Pressable style={styles.footerAction} onPress={onToggleLike}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#E38585' : colors.textMuted}
          />
          <Text style={styles.footerText}>{post.likesCount}</Text>
        </Pressable>

        <View style={styles.footerAction}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={styles.footerText}>{post.commentsCount}</Text>
        </View>

        <Pressable style={styles.viewPlace} onPress={onViewPlace}>
          <Text style={styles.viewPlaceText}>Ver lugar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerInfo: {
    flex: 1,
    gap: 1,
  },
  petName: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  pointsBadge: {
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  pointsBadgeText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: radii.md,
    backgroundColor: colors.cremaBase,
  },
  text: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textMuted,
  },
  viewPlace: {
    marginLeft: 'auto',
  },
  viewPlaceText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.verdeParque,
  },
});
