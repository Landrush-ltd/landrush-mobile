import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';
import { celebrationHaptics } from '../utils/haptics';

export interface FirstTimeEvent {
  id: string;
  title: string;
  message: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}

interface FirstTimeOverlayProps {
  event: FirstTimeEvent;
  visible: boolean;
  onDismiss: () => void;
}

/**
 * First-time moment celebration overlay
 * Celebrates milestones:
 * - First listing viewed
 * - First listing saved
 * - First agent message
 * - First booking
 */
export function FirstTimeOverlay({
  event,
  visible,
  onDismiss,
}: FirstTimeOverlayProps) {
  const colors = useColors();
  const scale = useSharedValue(0);
  const arrow = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      celebrationHaptics();
      scale.value = withSpring(1, {
        damping: 8,
        mass: 0.6,
      });
      arrow.value = withDelay(
        300,
        withSpring(1, {
          damping: 10,
        })
      );
    } else {
      scale.value = withSpring(0, {
        damping: 12,
      });
    }
  }, [visible]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    opacity: arrow.value,
    transform: [{ translateX: arrow.value * -20 }],
  }));

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onDismiss}
      activeOpacity={1}
    >
      <Animated.View
        entering={FadeInDown.springify()}
        style={[
          styles.card,
          { backgroundColor: event.color + '15', borderColor: event.color },
          scaleStyle,
        ]}
      >
        {/* Icon */}
        <View
          style={[
            styles.iconBg,
            { backgroundColor: event.color },
          ]}
        >
          <Ionicons name={event.icon} size={40} color="#FFFFFF" />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, { color: event.color }]}>
            {event.title}
          </Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {event.message}
          </Text>
        </View>

        {/* Arrow hint */}
        <Animated.View style={[arrowStyle, styles.arrow]}>
          <Ionicons
            name="arrow-forward"
            size={20}
            color={event.color}
          />
        </Animated.View>
      </Animated.View>

      {/* Backdrop hint */}
      <View style={styles.backdrop} pointerEvents="none" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: Spacing.xl,
    zIndex: 1000,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    marginHorizontal: Spacing.lg,
    ...Shadow.lg,
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  content: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
  },
  message: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: Spacing.md,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
