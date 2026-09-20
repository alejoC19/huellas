import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';

import { colors } from '../theme';
import { PawIcon } from './PawIcon';

type TrailStep = { x: number; y: number; rotate: number };

// Recorrido zigzagueante de abajo hacia arriba, como el rastro alternado
// de las patas de un perro caminando (no una línea recta).
const DEFAULT_TRAIL: TrailStep[] = [
  { x: 0.42, y: 0.86, rotate: -18 },
  { x: 0.63, y: 0.74, rotate: 20 },
  { x: 0.4, y: 0.62, rotate: -20 },
  { x: 0.63, y: 0.5, rotate: 18 },
  { x: 0.41, y: 0.38, rotate: -22 },
  { x: 0.61, y: 0.26, rotate: 16 },
  { x: 0.46, y: 0.15, rotate: -10 },
];

type Props = {
  steps?: TrailStep[];
  pawSize?: number;
  color?: string;
  stepDelay?: number;
  onComplete?: () => void;
};

export function PawTrail({
  steps = DEFAULT_TRAIL,
  pawSize = 34,
  color = colors.verdeHuella,
  stepDelay = 220,
  onComplete,
}: Props) {
  const { width, height } = useWindowDimensions();
  const progress = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = progress.map((value) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      })
    );

    Animated.stagger(stepDelay, animations).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {steps.map((step, index) => {
        const value = progress[index];
        const scale = value.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
        const translateY = value.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              left: step.x * width - pawSize / 2,
              top: step.y * height - pawSize / 2,
              opacity: value,
              transform: [{ translateY }, { scale }, { rotate: `${step.rotate}deg` }],
            }}
          >
            <PawIcon size={pawSize} color={color} />
          </Animated.View>
        );
      })}
    </View>
  );
}
