import React from 'react';
import { View, Text } from 'react-native';

const MARK_DARK = '#1A5C3A';
const MARK_LIGHT = '#8DC63F';
const TEXT_GREEN = '#7B8A2E';

interface Props {
  size?: number;
  showText?: boolean;
  textColor?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function LandrushLogo({
  size = 56,
  showText = true,
  textColor = TEXT_GREEN,
  orientation = 'horizontal',
}: Props) {
  const cell = size / 2;
  const gap = Math.round(size * 0.08);
  const radius = Math.round(cell * 0.22);

  const mark = (
    <View style={{ flexDirection: 'row', gap }}>
      {/* Left column: two stacked squares */}
      <View style={{ gap }}>
        {/* Top-left dark green square */}
        <View
          style={{
            width: cell,
            height: cell,
            backgroundColor: MARK_DARK,
            borderRadius: radius,
          }}
        />
        {/* Bottom-left light green with curved wave lines */}
        <View
          style={{
            width: cell,
            height: cell,
            backgroundColor: MARK_LIGHT,
            borderRadius: radius,
            overflow: 'hidden',
          }}
        >
          {/* Wave arc 1 */}
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
          {/* Wave arc 2 */}
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
      </View>

      {/* Right column: single tall dark green rectangle */}
      <View
        style={{
          width: cell,
          height: cell * 2 + gap,
          backgroundColor: MARK_DARK,
          borderRadius: radius,
        }}
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
      {textBlock}
    </View>
  );
}
