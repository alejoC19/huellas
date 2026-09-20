import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { colors } from '../theme';
import { CATEGORY_ICONS, PlaceCategory } from '../data/places';

const CATEGORY_COLORS: Record<PlaceCategory, string> = {
  plaza: colors.verdeParque,
  cafe: colors.amarilloSolera,
  veterinaria: colors.azulVereda,
};

const CATEGORY_ICON_COLORS: Record<PlaceCategory, string> = {
  plaza: colors.white,
  cafe: colors.azulVereda,
  veterinaria: colors.white,
};

type Props = {
  category: PlaceCategory;
  selected?: boolean;
  dimmed?: boolean;
};

export function PlacePin({ category, selected, dimmed }: Props) {
  const size = selected ? 44 : 34;

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: CATEGORY_COLORS[category],
          opacity: dimmed ? 0.35 : 1,
          borderWidth: selected ? 3 : 0,
        },
      ]}
    >
      <Ionicons
        name={CATEGORY_ICONS[category] as keyof typeof Ionicons.glyphMap}
        size={selected ? 20 : 16}
        color={CATEGORY_ICON_COLORS[category]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.verdeHuella,
    shadowColor: colors.azulVereda,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
});
