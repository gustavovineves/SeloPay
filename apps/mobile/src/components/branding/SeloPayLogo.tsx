import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Brand } from './tokens';

export type LogoVariant = 'mark' | 'full';
export type LogoTheme = 'light' | 'dark';
export type LogoSize = 'sm' | 'md' | 'lg';

interface SeloPayLogoProps {
  variant?: LogoVariant;
  theme?: LogoTheme;
  size?: LogoSize | number;
}

const PRESETS: Record<LogoSize, { mark: number; fontSize: number; gap: number }> = {
  sm: { mark: 28, fontSize: 12, gap: 5 },
  md: { mark: 52, fontSize: 18, gap: 9 },
  lg: { mark: 76, fontSize: 26, gap: 13 },
};

// Curved checkmark inside a 100×100 viewBox (ring outer r=44, inner r=35)
// First leg uses cubic bezier for a refined, graceful curve at the vertex.
const CHECK_PATH = 'M 29,51 C 33,58 38,63 42,64 L 71,36';

export function SeloPayLogo({
  variant = 'full',
  theme = 'light',
  size = 'md',
}: SeloPayLogoProps) {
  const preset =
    typeof size === 'number'
      ? { mark: size, fontSize: Math.round(size * 0.34), gap: Math.round(size * 0.17) }
      : PRESETS[size];

  const ringColor = theme === 'dark' ? Brand.colors.white : Brand.colors.teal;
  const goldColor = theme === 'dark' ? Brand.colors.goldLight : Brand.colors.gold;
  const textColor = theme === 'dark' ? Brand.colors.white : Brand.colors.teal;

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={preset.mark} height={preset.mark} viewBox="0 0 100 100">
        {/* Outer ring */}
        <Circle cx="50" cy="50" r="44" fill="none" stroke={ringColor} strokeWidth="3" />
        {/* Inner subtle ring — adds depth without noise */}
        <Circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke={ringColor}
          strokeWidth="0.75"
          opacity="0.22"
        />
        {/* Gold checkmark — curved first leg for a refined, premium feel */}
        <Path
          d={CHECK_PATH}
          fill="none"
          stroke={goldColor}
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      {variant === 'full' && (
        <View style={{ flexDirection: 'row', marginTop: preset.gap, alignItems: 'baseline' }}>
          <Text
            style={{
              fontSize: preset.fontSize,
              color: textColor,
              fontWeight: '500',
              letterSpacing: 0.8,
            }}
          >
            Selo
          </Text>
          <Text
            style={{
              fontSize: preset.fontSize,
              color: textColor,
              fontWeight: '800',
              letterSpacing: 0.8,
            }}
          >
            Pay
          </Text>
        </View>
      )}
    </View>
  );
}
