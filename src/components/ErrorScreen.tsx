import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  ShakeKeyframe,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius } from '../constants/theme';

interface ErrorScreenProps {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}

/**
 * Error screen with helpful feedback
 * Shake animation to grab attention without being annoying
 * Friendly tone helps the user recover
 */
export function ErrorScreen({
  title,
  subtitle,
  icon = 'alert-circle',
  actionLabel = 'Try again',
  onAction,
  color,
}: ErrorScreenProps) {
  const colors = useColors();
  const shake = useSharedValue(0);
  const errorColor = color || '#FF3B30';

  React.useEffect(() => {
    // Gentle shake animation on mount
    shake.value = withSequence(
      withTiming(1, { duration: 50, easing: Easing.inOut(Easing.ease) }),
      withTiming(-1, { duration: 50, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 50, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 50, easing: Easing.inOut(Easing.ease) })
    );
  }, []);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value * 8 }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[styles.iconWrap, shakeStyle]}
        entering={FadeInUp.springify()}
      >
        <View
          style={[
            styles.iconBg,
            { backgroundColor: errorColor + '15' },
          ]}
        >
          <Ionicons
            name={icon}
            size={80}
            color={errorColor}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={styles.contentWrap}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).springify()}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: errorColor },
          ]}
          onPress={onAction}
          activeOpacity={0.8}
        >
          <Ionicons name="reload" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Helpful hint */}
      <View style={[styles.hint, { borderColor: colors.border }]}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={[styles.hintText, { color: colors.textSecondary }]}>
          Check your connection and try again
        </Text>
      </View>
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
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  hintText: {
    fontSize: FontSize.sm,
    fontFamily: FontFamily.regular,
    flex: 1,
  },
});
