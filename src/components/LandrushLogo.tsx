import React from 'react';
import { View, Text, Animated } from 'react-native';

// Exact colors from the logo PNG
const MARK_DARK  = '#1A5C3A';
const MARK_LIGHT = '#8DC63F';
const TEXT_GREEN = '#8DC63F'; // matches the lime block, not olive

export interface LandrushLogoAnimatedProps {
  topLeftAnim?:     Animated.Value; // translateY from top
  bottomLeftAnim?:  Animated.Value; // translateX from left
  topRightAnim?:    Animated.Value; // translateX from right
  bottomRightAnim?: Animated.Value; // translateX from right (delayed)
  textOpacity?:     Animated.Value;
  textTranslateX?:  Animated.Value;
}

interface Props {
  size?:        number;
  showText?:    boolean;
  textColor?:   string;
  orientation?: 'horizontal' | 'vertical';
  animated?:    LandrushLogoAnimatedProps;
}

export function LandrushLogo({
  size = 56,
  showText = true,
  textColor = TEXT_GREEN,
  orientation = 'horizontal',
  animated,
}: Props) {
  const cell   = size / 2;
  const gap    = Math.round(size * 0.08);
  const radius = Math.round(cell * 0.22);
  // Large inner radius creates the concave arch between the two right blocks
  const innerR = Math.round(cell * 0.9);

  // Wrap each block in Animated.View only when animation values are provided
  const wrap = (
    child: React.ReactNode,
    anim?: Animated.Value,
    axis: 'X' | 'Y' = 'X',
    direction: 1 | -1 = 1,
  ): React.ReactNode => {
    if (!anim) return child;
    const transform = axis === 'Y'
      ? [{ translateY: anim }]
      : [{ translateX: anim }];
    return <Animated.View style={{ transform }}>{child}</Animated.View>;
  };

  // Top-left: dark green square, all standard rounded corners
  const topLeft = (
    <View
      style={{
        width: cell,
        height: cell,
        backgroundColor: MARK_DARK,
        borderRadius: radius,
      }}
    />
  );

  // Bottom-left: lime green square with two topographic arc lines
  const bottomLeft = (
    <View
      style={{
        width: cell,
        height: cell,
        backgroundColor: MARK_LIGHT,
        borderRadius: radius,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          bottom: cell * 0.38,
          left: -cell * 0.15,
          width: cell * 1.3,
          height: cell * 0.52,
          backgroundColor: 'rgba(255,255,255,0.30)',
          borderRadius: cell * 0.9,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: cell * 0.12,
          left: -cell * 0.15,
          width: cell * 1.3,
          height: cell * 0.52,
          backgroundColor: 'rgba(255,255,255,0.18)',
          borderRadius: cell * 0.9,
        }}
      />
    </View>
  );

  // Top-right: dark green square — large bottom-left radius creates the arch opening
  const topRight = (
    <View
      style={{
        width: cell,
        height: cell,
        backgroundColor: MARK_DARK,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
        borderBottomLeftRadius: innerR,  // ← concave arch
      }}
    />
  );

  // Bottom-right: dark green square — large top-left radius mirrors the arch above
  const bottomRight = (
    <View
      style={{
        width: cell,
        height: cell,
        backgroundColor: MARK_DARK,
        borderTopLeftRadius: innerR,     // ← concave arch
        borderTopRightRadius: radius,
        borderBottomRightRadius: radius,
        borderBottomLeftRadius: radius,
      }}
    />
  );

  const mark = (
    <View style={{ flexDirection: 'row', gap }}>
      {/* Left column */}
      <View style={{ gap }}>
        {wrap(topLeft,    animated?.topLeftAnim,    'Y')}
        {wrap(bottomLeft, animated?.bottomLeftAnim, 'X', -1)}
      </View>

      {/* Right column — two separate blocks */}
      <View style={{ gap }}>
        {wrap(topRight,    animated?.topRightAnim)}
        {wrap(bottomRight, animated?.bottomRightAnim)}
      </View>
    </View>
  );

  const textBlock = (
    <View>
      <Text
        style={{
          fontSize: size * 0.36,
          fontWeight: '800',
          color: textColor,
          letterSpacing: size * 0.015,
          lineHeight: size * 0.44,
        }}
      >
        LAND
      </Text>
      <Text
        style={{
          fontSize: size * 0.36,
          fontWeight: '800',
          color: textColor,
          letterSpacing: size * 0.015,
          lineHeight: size * 0.44,
        }}
      >
        RUSH
      </Text>
    </View>
  );

  if (!showText) return mark;

  const TextWrapper = animated?.textOpacity ? Animated.View : View;
  const textStyle = animated?.textOpacity
    ? {
        opacity: animated.textOpacity,
        transform: animated.textTranslateX
          ? [{ translateX: animated.textTranslateX }]
          : undefined,
      }
    : {};

  if (orientation === 'vertical') {
    return (
      <View style={{ alignItems: 'center', gap: size * 0.18 }}>
        {mark}
        <View style={{ flexDirection: 'row', gap: size * 0.08 }}>
          <Text style={{ fontSize: size * 0.36, fontWeight: '800', color: textColor, letterSpacing: size * 0.015 }}>
            LAND
          </Text>
          <Text style={{ fontSize: size * 0.36, fontWeight: '800', color: textColor, letterSpacing: size * 0.015 }}>
            RUSH
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: size * 0.22 }}>
      {mark}
      <TextWrapper style={textStyle}>{textBlock}</TextWrapper>
    </View>
  );
}
