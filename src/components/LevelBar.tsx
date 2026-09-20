import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, fontSizes, radii, spacing } from '../theme';
import { getLevelInfo, LEVELS } from '../utils/levels';

type Props = {
  points: number;
  compact?: boolean;
};

export function LevelBar({ points, compact }: Props) {
  const { level, nextLevel, progress, pointsToNext } = getLevelInfo(points);

  return (
    <View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      {!compact && (
        <Text style={styles.hint}>
          {nextLevel
            ? `Te faltan ${pointsToNext} pts para ${nextLevel.name} / ${nextLevel.min}`
            : `¡Nivel máximo alcanzado, ${level.name}!`}
        </Text>
      )}
    </View>
  );
}

type StepsProps = {
  points: number;
};

export function LevelSteps({ points }: StepsProps) {
  const { levelIndex } = getLevelInfo(points);

  return (
    <View style={styles.stepsRow}>
      {LEVELS.map((lvl, index) => {
        const active = index === levelIndex;
        const done = index < levelIndex;
        return (
          <View key={lvl.name} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                (active || done) && styles.stepDotActive,
                active && styles.stepDotCurrent,
              ]}
            />
            <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{lvl.name}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 253, 246, 0.16)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.verdeHuella,
  },
  hint: {
    marginTop: spacing.sm,
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.sm,
    color: colors.textOnDarkMuted,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 253, 246, 0.16)',
  },
  stepDotActive: {
    backgroundColor: colors.verdeHuella,
  },
  stepDotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  stepLabel: {
    fontFamily: fonts.textMedium,
    fontSize: fontSizes.xs,
    color: colors.textOnDarkMuted,
  },
  stepLabelActive: {
    color: colors.textOnDark,
  },
});
