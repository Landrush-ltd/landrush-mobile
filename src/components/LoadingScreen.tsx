import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
import { Spacing, FontSize, FontFamily } from '../constants/theme';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export function LoadingScreen({
  message = 'Loading...',
  showLogo = true,
}: LoadingScreenProps) {
  const colors = useColors();
  const spinValue = useSharedValue(0);
  const pulseValue = useSharedValue(0);

  useEffect(() => {
    // Continuous spin animation
    spinValue.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    // Pulse animation for background
    pulseValue.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

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
    opacity: interpolate(pulseValue.value, [0, 1], [0.3, 0.6], Extrapolate.CLAMP),
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pulsing background circle */}
      <Animated.View
        style={[
          styles.pulseCircle,
          {
            borderColor: colors.primary,
          },
          pulseStyle,
        ]}
      />

      {/* Spinning icon */}
      <Animated.View style={spinStyle}>
        <Ionicons name="pin" size={48} color={colors.primary} />
      </Animated.View>

      {/* Loading text */}
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      {/* Animated dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((i) => (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: colors.primary,
              },
              useAnimatedStyle(() => ({
                opacity: interpolate(
                  (pulseValue.value + i * 0.3) % 1,
                  [0, 0.5, 1],
                  [0.3, 1, 0.3],
                  Extrapolate.CLAMP
                ),
              })),
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  pulseCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  message: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    marginTop: Spacing.lg,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
