import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';

interface AnimatedRefreshProps {
  isRefreshing: boolean;
  size?: number;
}

/**
 * Animated refresh spinner for pull-to-refresh
 * Smooth rotation with pulsing opacity
 */
export function AnimatedRefresh({
  isRefreshing,
  size = 24,
}: AnimatedRefreshProps) {
  const colors = useColors();
  const spinValue = useSharedValue(0);
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    if (isRefreshing) {
      spinValue.value = withRepeat(
        withTiming(1, {
          duration: 1200,
          easing: Easing.linear,
        }),
        -1
      );

      pulseValue.value = withRepeat(
        withTiming(1, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    } else {
      spinValue.value = withTiming(0, { duration: 300 });
      pulseValue.value = withTiming(0, { duration: 300 });
    }
  }, [isRefreshing]);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(
          spinValue.value,
          [0, 1],
          [0, 360],
          Extrapolate.CLAMP
        )}deg`,
      },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      pulseValue.value,
      [0, 1],
      [0.6, 1],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <Animated.View style={[spinStyle, pulseStyle]}>
      <Ionicons name="refresh" size={size} color={colors.primary} />
    </Animated.View>
  );
}
