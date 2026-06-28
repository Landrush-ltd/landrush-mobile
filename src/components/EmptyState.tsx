import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
  animated?: boolean;
}

export function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  iconColor,
  animated = true,
}: EmptyStateProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  const content = (
    <View style={styles.container}>
      <Animated.View
        entering={animated ? ZoomIn.springify().delay(0) : undefined}
        style={styles.iconContainer}
      >
        <View
          style={[
            styles.iconBg,
            { backgroundColor: (iconColor || colors.primary) + '15' },
          ]}
        >
          <Ionicons
            name={icon}
            size={56}
            color={iconColor || colors.primary}
          />
        </View>
      </Animated.View>

      <Animated.View
        entering={animated ? FadeInUp.delay(100).springify() : undefined}
      >
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </Animated.View>

      {actionLabel && onAction && (
        <Animated.View
          entering={animated ? FadeInUp.delay(200).springify() : undefined}
        >
          <TouchableOpacity
            style={[
              styles.actionBtn,
              { backgroundColor: colors.primary },
            ]}
            onPress={onAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.white} />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );

  return content;
}

function useStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
      gap: Spacing.lg,
      minHeight: 300,
    },
    iconContainer: {
      marginBottom: Spacing.md,
    },
    iconBg: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: FontSize.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: BorderRadius.full,
      marginTop: Spacing.md,
    },
    actionText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: colors.white,
    },
  });
}
