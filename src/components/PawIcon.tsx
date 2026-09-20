import Svg, { Path } from 'react-native-svg';

import { colors } from '../theme';

type Props = {
  size?: number;
  color?: string;
};

export function PawIcon({ size = 40, color = colors.verdeHuella }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Path
        d="M20 30c4.4 0 8 4.5 8 10s-3.6 10-8 10-8-4.5-8-10 3.6-10 8-10Z"
        fill={color}
      />
      <Path
        d="M44 30c4.4 0 8 4.5 8 10s-3.6 10-8 10-8-4.5-8-10 3.6-10 8-10Z"
        fill={color}
      />
      <Path
        d="M14 14c3.3 0 6 3.6 6 8s-2.7 8-6 8-6-3.6-6-8 2.7-8 6-8Z"
        fill={color}
      />
      <Path
        d="M50 14c3.3 0 6 3.6 6 8s-2.7 8-6 8-6-3.6-6-8 2.7-8 6-8Z"
        fill={color}
      />
      <Path
        d="M32 34c7 0 14 5.8 14 13.5S39.8 56 32 56s-14-4.8-14-8.5S25 34 32 34Z"
        fill={color}
      />
    </Svg>
  );
}
