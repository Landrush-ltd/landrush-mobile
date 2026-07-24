import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow } from '../constants/theme';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: 'search' | 'card' | 'heart' | 'longpress' | 'swipe' | 'categories' | 'profile' | 'create';
  hint: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

interface TutorialOverlayProps {
  step: TutorialStep | null;
  visible: boolean;
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}

/**
 * Interactive tutorial overlay with step highlighting and instructions
 * Guides new users through app features and gestures
 */
export function TutorialOverlay({
  step,
  visible,
  onNext,
  onSkip,
  currentStep,
  totalSteps,
}: TutorialOverlayProps) {
  const colors = useColors();
  const scale = useSharedValue(0);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = visible ? withSpring(1) : 0;
  }, [visible]);

  if (!step || !visible) return null;

  const getTargetPosition = () => {
    const screenHeight = Dimensions.get('window').height;
    const targetPositions: Record<string, { top: number }> = {
      search: { top: screenHeight * 0.15 },
      card: { top: screenHeight * 0.3 },
      heart: { top: screenHeight * 0.4 },
      longpress: { top: screenHeight * 0.35 },
      swipe: { top: screenHeight * 0.45 },
      categories: { top: screenHeight * 0.25 },
      profile: { top: screenHeight * 0.2 },
      create: { top: screenHeight * 0.5 },
    };

    const targetPos = targetPositions[step?.target] || targetPositions.card;
    return {
      top: targetPos.top,
      left: 20,
      right: 20,
    };
  };

  const position = getTargetPosition();

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Dimmed background */}
      <TouchableOpacity
        style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
        activeOpacity={1}
        pointerEvents="box-none"
      />

      {/* Highlight circle/box (animated) */}
      <Animated.View
        style={[
          styles.highlight,
          {
            top: position.top,
            left: position.left,
            right: position.right,
            borderColor: colors.primary,
          },
          scaleStyle,
        ]}
      />

      {/* Instruction card */}
      <Animated.View
        entering={FadeInDown.springify()}
        exiting={FadeOutDown.springify()}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            top: Spacing.xl,
            borderTopColor: colors.primary,
          },
        ]}
        pointerEvents="box-none"
      >
        <View style={styles.iconWrap}>
          <View
            style={[
              styles.iconBg,
              { backgroundColor: colors.primary + '20' },
            ]}
          >
            <Ionicons name={step.icon} size={32} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {step.title}
        </Text>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {step.description}
        </Text>

        <View style={styles.hint}>
          <Ionicons name="bulb-outline" size={16} color={colors.primary} />
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            {step.hint}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.skipBtn, { borderColor: colors.border }]}
            onPress={onSkip}
            pointerEvents="box-none"
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
            onPress={onNext}
            pointerEvents="box-none"
          >
            <Text style={styles.nextText}>
              {currentStep === totalSteps - 1 ? 'Done' : 'Next'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  highlight: {
    position: 'absolute',
    height: 120,
    borderWidth: 2,
    borderRadius: 12,
    opacity: 0.8,
  },
  card: {
    position: 'absolute',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadow.lg,
    borderTopWidth: 3,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  iconBg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: FontSize.lg,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  description: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: Spacing.md,
    letterSpacing: 0.2,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    backgroundColor: 'rgba(159, 187, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(159, 187, 68, 0.3)',
  },
  hintText: {
    fontSize: FontSize.sm,
    flex: 1,
    letterSpacing: 0.2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  nextBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  nextText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});
