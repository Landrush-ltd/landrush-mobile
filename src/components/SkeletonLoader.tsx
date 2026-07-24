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
import { Spacing, BorderRadius } from '../constants/theme';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

/**
 * Skeleton loading placeholder
 * Subtle shimmer animation while content loads
 * Prevents layout shift and feels more premium than spinner
 */
export function SkeletonLoader({
  width = '100%',
  height = 200,
  borderRadius: radius = BorderRadius.lg,
  style,
}: SkeletonLoaderProps) {
  const colors = useColors();
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.5, 1, 0.5], Extrapolate.CLAMP),
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.border,
        },
        shimmerStyle,
        style,
      ]}
    />
  );
}

/**
 * Card skeleton - mimics a listing card
 */
export function CardSkeleton() {
  const colors = useColors();

  return (
    <View style={styles.cardWrap}>
      <SkeletonLoader height={200} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader height={16} width="80%" />
        <SkeletonLoader height={12} width="60%" style={{ marginTop: Spacing.sm }} />
        <SkeletonLoader height={14} width="40%" style={{ marginTop: Spacing.md }} />
      </View>
    </View>
  );
}

/**
 * Text skeleton - multiple lines
 */
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <View style={styles.textWrap}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          height={12}
          width={i === lines - 1 ? '60%' : '100%'}
          style={{ marginBottom: i < lines - 1 ? Spacing.sm : 0 }}
        />
      ))}
    </View>
  );
}

/**
 * Profile skeleton
 */
export function ProfileSkeleton() {
  return (
    <View style={styles.profileWrap}>
      <SkeletonLoader width={80} height={80} borderRadius={40} />
      <SkeletonLoader height={16} width="60%" style={{ marginTop: Spacing.md }} />
      <SkeletonLoader height={12} width="40%" style={{ marginTop: Spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  cardWrap: {
    marginBottom: Spacing.lg,
  },
  cardContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  textWrap: {
    gap: Spacing.sm,
  },
  profileWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
});
