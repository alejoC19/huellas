import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { colors } from '../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
  size?: number;
};

export function StarPicker({ value, onChange, size = 28 }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={4}>
          <Ionicons
            name={star <= value ? 'star' : 'star-outline'}
            size={size}
            color={colors.amarilloSolera}
          />
        </Pressable>
      ))}
    </View>
  );
}
