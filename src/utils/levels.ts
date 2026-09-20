export type Level = {
  name: string;
  min: number;
  max: number | null;
};

export const LEVELS: Level[] = [
  { name: 'Cachorro', min: 0, max: 100 },
  { name: 'Compañero', min: 100, max: 300 },
  { name: 'Fanático', min: 300, max: 500 },
  { name: 'Embajador', min: 500, max: null },
];

export function getLevelInfo(points: number) {
  const index = LEVELS.findIndex((level) => points >= level.min && (level.max === null || points < level.max));
  const levelIndex = index === -1 ? LEVELS.length - 1 : index;
  const level = LEVELS[levelIndex];
  const nextLevel = LEVELS[levelIndex + 1] ?? null;
  const progress = level.max === null ? 1 : (points - level.min) / (level.max - level.min);
  const pointsToNext = nextLevel ? nextLevel.min - points : 0;

  return {
    level,
    levelIndex,
    nextLevel,
    progress: Math.max(0, Math.min(1, progress)),
    pointsToNext,
  };
}
