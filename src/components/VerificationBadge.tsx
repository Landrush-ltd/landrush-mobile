import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInScale,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';

interface VerificationBadgeProps {
  status: 'pending' | 'approved' | 'rejected';
  verificationDate?: string;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

/**
 * Gold verification badge for verified companies
 * Shows different states: pending, approved, rejected
 * With smooth animations and haptic feedback
 */
export function VerificationBadge({
  status,
  verificationDate,
  size = 'medium',
  showLabel = true,
}: VerificationBadgeProps) {
  const colors = useColors();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, mass: 1 });
  }, [status]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBadgeConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: 'shield-checkmark',
          label: 'Verified Company',
          color: '#FFD700', // Gold
          bgColor: '#FFD70020',
          textColor: '#D4A017',
        };
      case 'pending':
        return {
          icon: 'time-outline',
          label: 'Verification Pending',
          color: '#FFA500',
          bgColor: '#FFA50020',
          textColor: '#FF8C00',
        };
      case 'rejected':
        return {
          icon: 'close-circle',
          label: 'Verification Failed',
          color: '#FF6B6B',
          bgColor: '#FF6B6B20',
          textColor: '#C92A2A',
        };
      default:
        return {
          icon: 'help-circle',
          label: 'Unverified',
          color: '#999',
          bgColor: '#99990020',
          textColor: '#666',
        };
    }
  };

  const config = getBadgeConfig();
  const sizeMap = {
    small: 32,
    medium: 48,
    large: 64,
  };

  const iconSize = {
    small: 16,
    medium: 24,
    large: 32,
  };

  const badgeSize = sizeMap[size];
  const iconSizeValue = iconSize[size];

  return (
    <Animated.View
      entering={FadeInScale.springify()}
      style={[scaleStyle, { alignItems: 'center' }]}
    >
      {/* Badge Circle */}
      <View
        style={[
          styles.badge,
          {
            width: badgeSize,
            height: badgeSize,
            backgroundColor: config.bgColor,
            borderColor: config.color,
          },
        ]}
      >
        <Ionicons name={config.icon as any} size={iconSizeValue} color={config.color} />
      </View>

      {/* Label and Date */}
      {showLabel && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: config.textColor }]}>
            {config.label}
          </Text>
          {verificationDate && status === 'approved' && (
            <Text style={[styles.date, { color: colors.textTertiary }]}>
              Verified {verificationDate}
            </Text>
          )}
        </View>
      )}
    </Animated.View>
  );
}

/**
 * Inline verification badge - compact version for profile headers
 */
export function InlineVerificationBadge({
  status,
  showText = true,
}: {
  status: 'pending' | 'approved' | 'rejected';
  showText?: boolean;
}) {
  const colors = useColors();

  const getBadgeStyle = () => {
    switch (status) {
      case 'approved':
        return { icon: 'shield-checkmark', color: '#FFD700' };
      case 'pending':
        return { icon: 'time-outline', color: '#FFA500' };
      case 'rejected':
        return { icon: 'close-circle', color: '#FF6B6B' };
      default:
        return { icon: 'help-circle', color: '#999' };
    }
  };

  const style = getBadgeStyle();

  return (
    <View style={styles.inlineBadge}>
      <View
        style={[
          styles.inlineBadgeIcon,
          {
            backgroundColor: style.color + '20',
            borderColor: style.color,
          },
        ]}
      >
        <Ionicons name={style.icon as any} size={14} color={style.color} />
      </View>
      {showText && (
        <Text
          style={[
            styles.inlineBadgeText,
            { color: style.color },
          ]}
        >
          {status === 'approved' ? 'Verified' : status === 'pending' ? 'Pending' : 'Unverified'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 2,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  labelContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  date: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.regular,
    fontWeight: '400',
    marginTop: Spacing.xs,
  },
  inlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inlineBadgeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
});
