import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '../context/ThemeContext';
import type { ThemeColors } from '../constants/theme';

interface AnimatedCountupProps {
  from?: number;
  to: number;
  duration?: number;
  decimals?: number;
  style?: any;
  fontSize?: number;
  fontWeight?: '400' | '600' | '700' | '800';
}

/**
 * Animated count-up numbers
 * Perfect for: listing count, price, metrics
 * Feels premium and satisfying
 */
export function AnimatedCountup({
  from = 0,
  to,
  duration = 1500,
  decimals = 0,
  style,
  fontSize = 32,
  fontWeight = '700',
}: AnimatedCountupProps) {
  const colors = useColors();
  const progress = useSharedValue(0);
  const textRef = React.useRef<Text>(null);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [to]);

  const animatedStyle = useAnimatedStyle(() => {
    const current = interpolate(
      progress.value,
      [0, 1],
      [from, to],
      Extrapolate.CLAMP
    );

    return {
      color: colors.textPrimary,
    };
  }, [from, to]);

  // Use native text formatting to avoid layout thrashing
  const displayValue = React.useMemo(() => {
    const current = progress.value * (to - from) + from;
    const formatted = decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toString();
    return formatted;
  }, [progress.value, from, to, decimals]);

  return (
    <Animated.Text
      ref={textRef}
      style={[
        animatedStyle,
        styles.text,
        {
          fontSize,
          fontWeight,
        },
        style,
      ]}
    >
      {displayValue}
    </Animated.Text>
  );
}

/**
 * Price countup - formatted with currency
 */
export function PriceCountup({
  to,
  duration = 1500,
  style,
}: {
  to: number;
  duration?: number;
  style?: any;
}) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [to]);

  const animatedStyle = useAnimatedStyle(() => {
    const current = Math.round(progress.value * to);
    const formatted =
      current >= 1_000_000
        ? `₦${(current / 1_000_000).toFixed(1)}M`
        : current >= 1_000
        ? `₦${(current / 1_000).toFixed(0)}K`
        : `₦${current}`;

    return {
      color: colors.primary,
    };
  }, [to]);

  return (
    <Animated.Text
      style={[
        animatedStyle,
        styles.text,
        {
          fontSize: 28,
          fontWeight: '800',
        },
        style,
      ]}
    >
      {/* Placeholder - actual value computed in animatedStyle */}
      ₦0
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontVariant: ['tabular-nums'],
  },
});
