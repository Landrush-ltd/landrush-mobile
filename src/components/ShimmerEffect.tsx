import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '../context/ThemeContext';
import { BorderRadius } from '../constants/theme';

interface ShimmerEffectProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
}

/**
 * Shimmer effect - sliding highlight across placeholder
 * More premium than plain skeleton for image loading
 * Mimics light reflection on content
 */
export function ShimmerEffect({
  width = '100%',
  height = 200,
  borderRadius: radius = BorderRadius.lg,
  style,
  children,
}: ShimmerEffectProps) {
  const colors = useColors();
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [0, 1],
          [-width as number, width as number],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}

      {/* Shimmer highlight */}
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.white,
            opacity: 0.2,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}

/**
 * Image shimmer - for image loading placeholders
 */
export function ImageShimmer() {
  return (
    <ShimmerEffect
      width="100%"
      height={240}
      borderRadius={12}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
  },
});
