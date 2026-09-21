import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '../theme';

export type Benefit = {
  id: string;
  title: string;
  placeName: string;
  neighborhood: string;
  pointsCost: number;
};

type Props = {
  benefit: Benefit;
  affordable: boolean;
  confirming: boolean;
  submitting: boolean;
  onPressRedeem: () => void;
  onConfirm: () => void;
  onCancel: () => void;
};

export function BenefitCard({
  benefit,
  affordable,
  confirming,
  submitting,
  onPressRedeem,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <View style={[styles.card, !affordable && styles.cardDisabled]}>
      <View style={styles.iconBadge}>
        <Ionicons name="gift" size={20} color={colors.azulVereda} />
      </View>

      <View style={styles.info}>
        <Text style={styles.title}>{benefit.title}</Text>
        <Text style={styles.meta}>
          {benefit.placeName} · {benefit.neighborhood}
        </Text>
      </View>

      {confirming ? (
        <View style={styles.confirmRow}>
          <Pressable style={styles.confirmNo} onPress={onCancel} disabled={submitting}>
            <Text style={styles.confirmNoText}>No</Text>
          </Pressable>
          <Pressable style={styles.confirmYes} onPress={onConfirm} disabled={submitting}>
            <Text style={styles.confirmYesText}>{submitting ? '...' : 'Sí'}</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={[styles.pointsPill, !affordable && styles.pointsPillDisabled]}
          onPress={affordable ? onPressRedeem : undefined}
          disabled={!affordable}
        >
          <Text style={[styles.pointsText, !affordable && styles.pointsTextDisabled]}>
            {benefit.pointsCost} pts
          </Text>
        </Pressable>
      )}
    </View>
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
  },
  cardDisabled: {
    opacity: 0.55,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.verdeHuella,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  meta: {
    fontFamily: fonts.textRegular,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  pointsPill: {
    backgroundColor: colors.verdeHuella,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  pointsPillDisabled: {
    backgroundColor: colors.cremaBase,
  },
  pointsText: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
  pointsTextDisabled: {
    color: colors.textMuted,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  confirmNo: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmNoText: {
    fontFamily: fonts.textSemiBold,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
  },
  confirmYes: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    backgroundColor: colors.verdeHuella,
  },
  confirmYesText: {
    fontFamily: fonts.displayBold,
    fontSize: fontSizes.xs,
    color: colors.azulVereda,
  },
});
