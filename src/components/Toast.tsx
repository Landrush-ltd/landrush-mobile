import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
  duration?: number;
  onDismiss?: () => void;
}

export function Toast({
  message,
  type = 'success',
  icon,
  duration = 2500,
  onDismiss,
}: ToastProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      setTimeout(() => {
        onDismiss?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: colors.lime + '15',
          text: colors.lime,
          icon: 'checkmark-circle' as const,
        };
      case 'error':
        return {
          bg: '#FF3B30' + '15',
          text: '#FF3B30',
          icon: 'close-circle' as const,
        };
      case 'warning':
        return {
          bg: '#FF9500' + '15',
          text: '#FF9500',
          icon: 'warning' as const,
        };
      case 'info':
        return {
          bg: colors.primary + '15',
          text: colors.primary,
          icon: 'information-circle' as const,
        };
      default:
        return {
          bg: colors.lime + '15',
          text: colors.lime,
          icon: 'checkmark-circle' as const,
        };
    }
  };

  const typeStyles = getTypeStyles();
  const displayIcon = icon || typeStyles.icon;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <Animated.View
        entering={FadeInUp.springify().damping(14)}
        exiting={FadeOutUp.springify()}
        style={[
          animatedStyle,
          {
            backgroundColor: typeStyles.bg,
            borderLeftColor: typeStyles.text,
          },
          styles.toast,
        ]}
      >
        <Ionicons
          name={displayIcon}
          size={20}
          color={typeStyles.text}
          style={styles.icon}
        />
        <Text
          style={[
            styles.message,
            {
              color: typeStyles.text,
            },
          ]}
          numberOfLines={2}
        >
          {message}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    maxWidth: 300,
    ...Shadow.md,
  },
  icon: {
    marginRight: Spacing.xs,
  },
  message: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
  },
});
