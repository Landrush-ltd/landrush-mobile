import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius } from '../constants/theme';

interface SuccessScreenProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  actionLabel?: string;
  onAction?: () => void;
  autoClose?: boolean;
  duration?: number;
}

/**
 * Full-screen success celebration
 * Appears after major actions (create listing, save, share)
 * Auto-closes or lets user tap to proceed
 */
export function SuccessScreen({
  title,
  subtitle,
  icon = 'checkmark-circle',
  actionLabel = 'Continue',
  onAction,
  autoClose = true,
  duration = 3000,
}: SuccessScreenProps) {
  const colors = useColors();
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered animations
    iconScale.value = withSpring(1, {
      damping: 8,
      mass: 0.6,
    });

    titleOpacity.value = withDelay(
      150,
      withSpring(1, {
        damping: 12,
        mass: 1,
      })
    );

    buttonOpacity.value = withDelay(
      300,
      withSpring(1, {
        damping: 12,
        mass: 1,
      })
    );

    if (autoClose && onAction) {
      const timer = setTimeout(() => {
        onAction();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.iconWrap, iconStyle]}>
        <View
          style={[
            styles.iconBg,
            { backgroundColor: colors.primary + '15' },
          ]}
        >
          <Ionicons
            name={icon}
            size={80}
            color={colors.primary}
          />
        </View>
      </Animated.View>

      <Animated.View style={[styles.contentWrap, titleStyle]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>

      {!autoClose && (
        <Animated.View style={buttonStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
            ]}
            onPress={onAction}
          >
            <Text style={styles.buttonText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    paddingHorizontal: Spacing.xl,
  },
  iconWrap: {
    marginBottom: Spacing.lg,
  },
  iconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrap: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontFamily: FontFamily.extraBold,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 44,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    minWidth: 200,
  },
  buttonText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semibold,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
