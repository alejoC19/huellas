import Svg, { Ellipse, Path } from 'react-native-svg';

import { colors } from '../theme';

type Props = {
  size?: number;
  color?: string;
};

export function PawIcon({ size = 40, color = colors.verdeHuella }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Ellipse cx={21} cy={38} rx={11} ry={15} fill={color} transform="rotate(-25 21 38)" />
      <Ellipse cx={38} cy={21} rx={10} ry={16} fill={color} transform="rotate(-8 38 21)" />
      <Ellipse cx={62} cy={21} rx={10} ry={16} fill={color} transform="rotate(8 62 21)" />
      <Ellipse cx={79} cy={38} rx={11} ry={15} fill={color} transform="rotate(25 79 38)" />
      <Path
        d="M50 90c-16 0-29-10-29-22 0-13 13-23 29-23s29 10 29 23c0 12-13 22-29 22Z"
        fill={color}
      />
    </Svg>
  );
}
