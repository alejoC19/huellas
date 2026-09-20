import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { colors } from '../theme';

type Props = {
  rating: number;
  size?: number;
};

export function StarRating({ rating, size = 14 }: Props) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;

  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {Array.from({ length: 5 }).map((_, index) => {
        const name = index < full ? 'star' : index === full && hasHalf ? 'star-half' : 'star-outline';
        return <Ionicons key={index} name={name} size={size} color={colors.amarilloSolera} />;
      })}
    </View>
  );
}
