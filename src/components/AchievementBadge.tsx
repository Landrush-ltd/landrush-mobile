import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';

interface AchievementBadgeProps {
  label: string;
  description: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  duration?: number;
  onComplete?: () => void;
}

/**
 * Achievement celebration badge
 * Appears when user hits a milestone (e.g., saved 10th listing)
 * Auto-dismisses after duration
 */
export function AchievementBadge({
  label,
  description,
  icon,
  color,
  duration = 4000,
  onComplete,
}: AchievementBadgeProps) {
  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    // Entrance animation
    scale.value = withSpring(1, {
      damping: 8,
      mass: 0.5,
    });

    // Pulse animation
    pulse.value = withSpring(1.05, {
      damping: 8,
    });

    // Auto-dismiss
    const timer = setTimeout(() => {
      scale.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      setTimeout(() => {
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.springify().damping(12)}
      exiting={FadeOutUp.springify()}
      style={[styles.container, scaleStyle]}
    >
      <Animated.View
        style={[
          styles.pulseRing,
          { borderColor: color },
          pulseStyle,
        ]}
      />

      <View style={[styles.badge, { backgroundColor: color + '15' }]}>
        <View
          style={[
            styles.iconBg,
            { backgroundColor: color },
          ]}
        >
          <Ionicons name={icon} size={32} color="#FFFFFF" />
        </View>

        <View style={styles.textWrap}>
          <Text style={[styles.label, { color }]}>
            {label}
          </Text>
          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        <Ionicons name="star" size={20} color={color} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Spacing.xl,
    right: Spacing.lg,
    zIndex: 999,
  },
  pulseRing: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 320,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    opacity: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    ...Shadow.md,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textWrap: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
  },
  description: {
    fontSize: FontSize.xs,
    color: '#666',
    fontFamily: FontFamily.regular,
  },
});
