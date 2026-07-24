import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../constants/theme';

interface CompanyRegistrationSuccessProps {
  companyName: string;
  onClose?: () => void;
  onViewProfile?: () => void;
}

/**
 * Success screen shown after company registration submission
 * Shows celebration animation and next steps
 */
export function CompanyRegistrationSuccess({
  companyName,
  onClose,
  onViewProfile,
}: CompanyRegistrationSuccessProps) {
  const colors = useColors();
  const checkScale = useSharedValue(0);

  useEffect(() => {
    checkScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.elastic(1)),
    });
  }, []);

  const checkAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Celebration Animation */}
      <Animated.View
        entering={FadeInUp.springify()}
        style={[
          styles.checkContainer,
          {
            backgroundColor: colors.primary + '20',
          },
          checkAnimStyle,
        ]}
      >
        <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
      </Animated.View>

      {/* Title & Message */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Registration Submitted! 🎉
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Thank you for registering {companyName} on Landrush.
        </Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          <Step
            number="1"
            title="Review Process"
            description="Our team will review your documents and credentials"
            colors={colors}
          />
          <Step
            number="2"
            title="Verification"
            description="You'll receive a notification within 24-48 hours"
            colors={colors}
          />
          <Step
            number="3"
            title="Gold Badge"
            description="Get your ✨ verification badge and start selling with trust"
            colors={colors}
          />
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: colors.lime + '15',
              borderColor: colors.lime,
            },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.lime} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You can check your verification status anytime in your profile settings.
          </Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        style={styles.buttonContainer}
      >
        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
            Done
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={onViewProfile}
        >
          <Ionicons name="person-circle-outline" size={20} color="#FFF" />
          <Text style={styles.primaryBtnText}>View Profile</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function Step({
  number,
  title,
  description,
  colors,
}: {
  number: string;
  title: string;
  description: string;
  colors: any;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.step}>
      <View
        style={[
          styles.stepNumber,
          { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
      >
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>
          {title}
        </Text>
        <Text style={[styles.stepDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  checkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xxxl,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
    letterSpacing: LetterSpacing.tight,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
  },
  stepsContainer: {
    width: '100%',
    gap: Spacing.lg,
    marginBottom: Spacing.xxl,
  },
  step: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: '#FFF',
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: Spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  primaryBtnText: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.semiBold,
    fontWeight: '600',
    color: '#FFF',
  },
});
