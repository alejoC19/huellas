import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_ICONS, Place } from '../data/places';
import { colors, fonts, fontSizes, radii, spacing } from '../theme';
import { StarRating } from './StarRating';

const CATEGORY_COLORS: Record<Place['category'], string> = {
  plaza: colors.verdeParque,
  cafe: colors.amarilloSolera,
  veterinaria: colors.azulVereda,
};

const CATEGORY_ICON_COLORS: Record<Place['category'], string> = {
  plaza: colors.white,
  cafe: colors.azulVereda,
  veterinaria: colors.white,
};

type Props = {
  place: Place;
  selected?: boolean;
  onPress?: () => void;
  onGo?: () => void;
};

export function PlaceCard({ place, selected, onPress, onGo }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={[styles.thumb, { backgroundColor: CATEGORY_COLORS[place.category] }]}>
        <Ionicons
          name={CATEGORY_ICONS[place.category] as keyof typeof Ionicons.glyphMap}
          size={22}
          color={CATEGORY_ICON_COLORS[place.category]}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {place.neighborhood} · {place.distanceLabel}
          {place.tags[0] ? ` · ${place.tags[0]}` : ''}
        </Text>
        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} size={12} />
          <Text style={styles.ratingText}>
            {place.rating.toFixed(1)} · {place.reviewCount} huellas
          </Text>
        </View>
      </View>

      <Pressable style={styles.goButton} onPress={onGo}>
        <Text style={styles.goLabel}>Ir</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing.md,
    width: 300,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  cardSelected: {
    borderColor: colors.verdeHuella,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  ratingText: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  goButton: {
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  goLabel: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.sm,
    color: colors.azulVereda,
  },
});
