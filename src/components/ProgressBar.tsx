import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useColors } from '../context/ThemeContext';
import { BorderRadius, Spacing } from '../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-1
  color?: string;
  height?: number;
  showLabel?: boolean;
  duration?: number;
  style?: any;
}

/**
 * Animated progress bar
 * Smooth fill animation with spring physics
 * Perfect for: form progress, upload progress, task completion
 */
export function ProgressBar({
  progress,
  color,
  height = 8,
  showLabel = false,
  duration = 500,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const fillProgress = useSharedValue(0);
  const barColor = color || colors.primary;

  useEffect(() => {
    // Use spring for smooth, bouncy feel
    fillProgress.value = withSpring(Math.max(0, Math.min(1, progress)), {
      damping: 12,
      mass: 1,
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: colors.border,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              borderRadius: height / 2,
              height,
            },
            fillStyle,
          ]}
        />
      </View>
      {showLabel && (
        <AnimatedLabel progress={fillProgress} color={barColor} />
      )}
    </View>
  );
}

/**
 * Labeled progress bar with percentage text
 */
export function LabeledProgressBar({
  progress,
  color,
  height = 12,
  style,
}: Omit<ProgressBarProps, 'showLabel'> & { style?: any }) {
  const colors = useColors();
  const fillProgress = useSharedValue(0);
  const barColor = color || colors.primary;

  useEffect(() => {
    fillProgress.value = withSpring(Math.max(0, Math.min(1, progress)), {
      damping: 12,
      mass: 1,
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fillProgress.value * 100}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: colors.border,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: barColor,
              borderRadius: height / 2,
              height,
            },
            fillStyle,
          ]}
        />
      </View>
      <AnimatedLabel progress={fillProgress} color={barColor} />
    </View>
  );
}

/**
 * Animated percentage label
 */
function AnimatedLabel({
  progress,
  color,
}: {
  progress: Animated.Shared<number>;
  color: string;
}) {
  const labelStyle = useAnimatedStyle(() => {
    const percent = Math.round(progress.value * 100);
    return {};
  });

  return (
    <Animated.Text
      style={[
        styles.label,
        labelStyle,
        { color },
      ]}
    >
      {Math.round(progress.value * 100)}%
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  fill: {
    width: '0%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
});
