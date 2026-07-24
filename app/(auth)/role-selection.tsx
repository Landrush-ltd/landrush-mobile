import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, FontSize, FontFamily, BorderRadius, LetterSpacing, Shadow } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { useAuthStore } from '../../src/store/auth';
import { CompanyRegistration } from '../../src/components/CompanyRegistration';
import { CompanyRegistrationSuccess } from '../../src/components/CompanyRegistrationSuccess';
import { triggerHaptic } from '../../src/utils/haptics';

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { user } = useAuthStore();

  const [selectedRole, setSelectedRole] = useState<'agent' | 'company' | 'individual' | 'buyer' | null>(null);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Helper to check if role is a lister (needs registration)
  const isListerRole = (role: typeof selectedRole) => role === 'agent' || role === 'company' || role === 'individual';

  // Button press animation
  const buttonScale = useSharedValue(1);
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleRoleSelect = (role: 'agent' | 'company' | 'individual' | 'buyer') => {
    void triggerHaptic('medium');
    setSelectedRole(role);

    if (isListerRole(role)) {
      setShowCompanyRegistration(true);
    } else {
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 300);
    }
  };

  const handleCompanyRegistrationComplete = (data: any) => {
    triggerHaptic('success');
    setShowCompanyRegistration(false);
    setShowSuccess(true);
  };

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  if (showSuccess) {
    return (
      <CompanyRegistrationSuccess
        companyName={user?.firstName || 'Company'}
        onClose={handleContinue}
        onViewProfile={handleContinue}
      />
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Welcome to Landrush! 🎉
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Tell us how you'd like to use Landrush
        </Text>
      </View>

      {/* Role Selection Cards */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Agent Card */}
        <Animated.View entering={FadeInUp.delay(0).springify().withInitialValues({ transform: [{ scale: 0.95 }], opacity: 0 })}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'agent' ? colors.primaryTint : colors.card,
                borderColor: selectedRole === 'agent' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleRoleSelect('agent')}
            activeOpacity={1}
          >
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Ionicons name="person-circle" size={40} color={colors.primary} />
            </View>

            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>
              I'm a Real Estate Agent
            </Text>

            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Professional agent listing properties and building your client base
            </Text>

            <View style={[styles.features, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Feature
                icon="shield-checkmark"
                text="Get verified with gold badge"
                colors={colors}
              />
              <Feature
                icon="list"
                text="Manage multiple listings"
                colors={colors}
              />
              <Feature
                icon="trending-up"
                text="Build your professional presence"
                colors={colors}
              />
            </View>

            {selectedRole === 'agent' && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.selectedBadgeText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Company Card */}
        <Animated.View entering={FadeInUp.delay(80).springify().withInitialValues({ transform: [{ scale: 0.95 }], opacity: 0 })}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'company' ? colors.primaryTint : colors.card,
                borderColor: selectedRole === 'company' ? colors.primary : colors.border,
              },
            ]}
            onPress={() => handleRoleSelect('company')}
            activeOpacity={1}
          >
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Ionicons name="building" size={40} color={colors.primary} />
            </View>

            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>
              I Represent a Real Estate Company
            </Text>

            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Register your company, list multiple properties, and earn the gold verification badge
            </Text>

            <View style={[styles.features, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Feature
                icon="shield-checkmark"
                text="Get company-wide verification badge"
                colors={colors}
              />
              <Feature
                icon="briefcase"
                text="Manage agents and listings"
                colors={colors}
              />
              <Feature
                icon="trending-up"
                text="Build professional credibility"
                colors={colors}
              />
            </View>

            {selectedRole === 'company' && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.selectedBadgeText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Individual Lister Card */}
        <Animated.View entering={FadeInUp.delay(160).springify().withInitialValues({ transform: [{ scale: 0.95 }], opacity: 0 })}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'individual' ? colors.limeTint : colors.card,
                borderColor: selectedRole === 'individual' ? colors.lime : colors.border,
              },
            ]}
            onPress={() => handleRoleSelect('individual')}
            activeOpacity={1}
          >
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: colors.lime + '20' },
              ]}
            >
              <Ionicons name="home" size={40} color={colors.lime} />
            </View>

            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>
              I'm an Individual Lister
            </Text>

            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              List your own land, farm, or property - get verified and build credibility
            </Text>

            <View style={[styles.features, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Feature
                icon="shield-checkmark"
                text="Get verified with gold badge"
                colors={colors}
              />
              <Feature
                icon="home"
                text="List your own properties"
                colors={colors}
              />
              <Feature
                icon="trending-up"
                text="Build personal credibility"
                colors={colors}
              />
            </View>

            {selectedRole === 'individual' && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: colors.lime },
                ]}
              >
                <Ionicons name="checkmark" size={18} color={colors.textPrimary} />
                <Text style={[styles.selectedBadgeText, { color: colors.textPrimary }]}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Buyer Card */}
        <Animated.View entering={FadeInUp.delay(240).springify().withInitialValues({ transform: [{ scale: 0.95 }], opacity: 0 })}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: selectedRole === 'buyer' ? colors.limeTint : colors.card,
                borderColor: selectedRole === 'buyer' ? colors.lime : colors.border,
              },
            ]}
            onPress={() => handleRoleSelect('buyer')}
            activeOpacity={1}
          >
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: colors.lime + '20' },
              ]}
            >
              <Ionicons name="search" size={40} color={colors.lime} />
            </View>

            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>
              I'm Searching for Land
            </Text>

            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Browse listings, save favorites, and connect with agents
            </Text>

            <View style={[styles.features, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
              <Feature
                icon="map"
                text="Explore land by location"
                colors={colors}
              />
              <Feature
                icon="heart"
                text="Save your favorite listings"
                colors={colors}
              />
              <Feature
                icon="chatbubble"
                text="Message agents directly"
                colors={colors}
              />
            </View>

            {selectedRole === 'buyer' && (
              <View
                style={[
                  styles.selectedBadge,
                  { backgroundColor: colors.lime },
                ]}
              >
                <Ionicons name="checkmark" size={18} color={colors.textPrimary} />
                <Text style={[styles.selectedBadgeText, { color: colors.textPrimary }]}>
                  Selected
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Info Box */}
        <Animated.View entering={FadeInUp.delay(320).springify().withInitialValues({ transform: [{ scale: 0.95 }], opacity: 0 })}>
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.primaryTint,
                borderColor: colors.primary + '30',
              },
            ]}
          >
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              You can change your role anytime from your profile settings
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom Button */}
      {selectedRole && (
        <Animated.View
          entering={FadeInUp.springify()}
          style={[
            styles.buttonContainer,
            { borderTopColor: colors.border },
          ]}
        >
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              style={[
                styles.continueBtn,
                {
                  backgroundColor: isListerRole(selectedRole) ? colors.primary : colors.lime,
                },
              ]}
              onPress={() => {
                void triggerHaptic('medium');
                buttonScale.value = withSpring(0.98, { damping: 12, mass: 1 });
                if (isListerRole(selectedRole)) {
                  setTimeout(() => setShowCompanyRegistration(true), 120);
                } else {
                  setTimeout(() => handleContinue(), 120);
                }
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1, { damping: 12, mass: 1 });
              }}
              activeOpacity={1}
            >
            <Text
              style={[
                styles.continueBtnText,
                {
                  color: isListerRole(selectedRole) ? colors.white : colors.textPrimary,
                },
              ]}
            >
              {selectedRole === 'agent'
                ? 'Register as Agent'
                : selectedRole === 'company'
                ? 'Register Your Company'
                : selectedRole === 'individual'
                ? 'Register to List'
                : 'Continue to Landrush'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={isListerRole(selectedRole) ? colors.white : colors.textPrimary}
            />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      )}

      {/* Company Registration Modal */}
      <Modal
        visible={showCompanyRegistration}
        animationType="slide"
        onRequestClose={() => setShowCompanyRegistration(false)}
      >
        <CompanyRegistration
          onCancel={() => {
            setShowCompanyRegistration(false);
            handleContinue();
          }}
          onComplete={handleCompanyRegistrationComplete}
        />
      </Modal>
    </View>
  );
}

function Feature({ icon, text, colors }: { icon: string; text: string; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Ionicons name={icon as any} size={14} color={colors.primary} />
      <Text style={{ fontSize: FontSize.sm, lineHeight: 20, color: colors.textSecondary, flex: 1 }}>
        {text}
      </Text>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: Spacing.xl + 8,
      paddingBottom: Spacing.md,
    },
    headerTitle: {
      fontSize: FontSize.huge,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      marginBottom: Spacing.md,
      letterSpacing: LetterSpacing.tight,
      lineHeight: 38,
    },
    headerSubtitle: {
      fontSize: FontSize.lg,
      lineHeight: 24,
      letterSpacing: 0.3,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      gap: 20,
    },
    roleCard: {
      borderRadius: BorderRadius.lg,
      padding: Spacing.lg,
      gap: Spacing.md,
      borderWidth: 1,
      ...Shadow.md,
    },
    roleIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleTitle: {
      fontSize: FontSize.xl,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      letterSpacing: LetterSpacing.snug,
      lineHeight: 24,
    },
    roleDescription: {
      fontSize: FontSize.md,
      lineHeight: 21,
      marginVertical: Spacing.sm,
    },
    features: {
      gap: 10,
      marginVertical: Spacing.md,
      paddingVertical: Spacing.md,
      borderTopWidth: 1,
      borderBottomWidth: 1,
    },
    feature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    featureText: {
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    selectedBadge: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.md,
      flexDirection: 'row',
      gap: Spacing.xs,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      borderRadius: BorderRadius.full,
      alignItems: 'center',
    },
    selectedBadgeText: {
      fontSize: FontSize.xs,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      color: '#FFF',
    },
    infoBox: {
      flexDirection: 'row',
      gap: Spacing.md,
      borderWidth: 1,
      borderRadius: BorderRadius.md,
      padding: Spacing.lg,
      alignItems: 'flex-start',
      marginBottom: Spacing.xxl,
    },
    infoText: {
      flex: 1,
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    buttonContainer: {
      paddingHorizontal: 20,
      paddingVertical: Spacing.lg,
      borderTopWidth: 1,
      gap: Spacing.md,
    },
    continueBtn: {
      paddingVertical: 12,
      borderRadius: BorderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    continueBtnText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  });
