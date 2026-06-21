import React from 'react';
import { View, Text, Animated } from 'react-native';

const MARK_DARK = '#1A5C3A';
const MARK_LIGHT = '#8DC63F';
const TEXT_GREEN = '#7B8A2E';

export interface LandrushLogoAnimatedProps {
  topLeftAnim?: Animated.Value;
  bottomLeftAnim?: Animated.Value;
  rightAnim?: Animated.Value;
  textOpacity?: Animated.Value;
  textTranslateX?: Animated.Value;
}

interface Props {
  size?: number;
  showText?: boolean;
  textColor?: string;
  orientation?: 'horizontal' | 'vertical';
  animated?: LandrushLogoAnimatedProps;
}

export function LandrushLogo({
  size = 56,
  showText = true,
  textColor = TEXT_GREEN,
  orientation = 'horizontal',
  animated,
}: Props) {
  const cell = size / 2;
  const gap = Math.round(size * 0.08);
  const radius = Math.round(cell * 0.22);

  const TopLeft = animated?.topLeftAnim ? Animated.View : View;
  const BottomLeftWrapper = animated?.bottomLeftAnim ? Animated.View : View;
  const RightCol = animated?.rightAnim ? Animated.View : View;
  const TextWrapper = animated?.textOpacity ? Animated.View : View;

  const topLeftStyle = animated?.topLeftAnim
    ? { transform: [{ translateY: animated.topLeftAnim }] }
    : {};
  const bottomLeftStyle = animated?.bottomLeftAnim
    ? { transform: [{ translateX: animated.bottomLeftAnim }] }
    : {};
  const rightStyle = animated?.rightAnim
    ? { transform: [{ translateX: animated.rightAnim }] }
    : {};
  const textStyle =
    animated?.textOpacity
      ? {
          opacity: animated.textOpacity,
          transform: animated.textTranslateX
            ? [{ translateX: animated.textTranslateX }]
            : undefined,
        }
      : {};

  const mark = (
    <View style={{ flexDirection: 'row', gap }}>
      {/* Left column */}
      <View style={{ gap }}>
        {/* Top-left: dark green */}
        <TopLeft
          style={[
            {
              width: cell,
              height: cell,
              backgroundColor: MARK_DARK,
              borderRadius: radius,
            },
            topLeftStyle,
          ]}
        />

        {/* Bottom-left: lime green with wave lines */}
        <BottomLeftWrapper style={bottomLeftStyle}>
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
                bottom: cell * 0.35,
                left: -cell * 0.15,
                width: cell * 1.3,
                height: cell * 0.55,
                backgroundColor: 'rgba(255,255,255,0.28)',
                borderRadius: cell * 0.8,
              }}
            />
            <View
              style={{
                position: 'absolute',
                bottom: cell * 0.15,
                left: -cell * 0.15,
                width: cell * 1.3,
                height: cell * 0.55,
                backgroundColor: 'rgba(255,255,255,0.18)',
                borderRadius: cell * 0.8,
              }}
            />
          </View>
        </BottomLeftWrapper>
      </View>

      {/* Right column: tall rectangle */}
      <RightCol
        style={[
          {
            width: cell,
            height: cell * 2 + gap,
            backgroundColor: MARK_DARK,
            borderRadius: radius,
          },
          rightStyle,
        ]}
      />
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

  if (orientation === 'vertical') {
    return (
      <View style={{ alignItems: 'center', gap: size * 0.18 }}>
        {mark}
        <View style={{ flexDirection: 'row', gap: size * 0.08 }}>
          <Text
            style={{
              fontSize: size * 0.36,
              fontWeight: '800',
              color: textColor,
              letterSpacing: size * 0.015,
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
            }}
          >
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
