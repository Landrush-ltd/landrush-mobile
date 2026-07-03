import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
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

  const [selectedRole, setSelectedRole] = useState<'agent' | 'company' | 'buyer' | null>(null);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRoleSelect = (role: 'agent' | 'company' | 'buyer') => {
    triggerHaptic('medium');
    setSelectedRole(role);

    if (role === 'agent' || role === 'company') {
      // Show company registration for agents and companies
      setShowCompanyRegistration(true);
    } else {
      // Skip for buyers
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
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedRole === 'agent' ? colors.primary : colors.border,
                borderWidth: selectedRole === 'agent' ? 2 : 1,
              },
            ]}
            onPress={() => handleRoleSelect('agent')}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.roleIcon,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Ionicons name="business" size={40} color={colors.primary} />
            </View>

            <Text style={[styles.roleTitle, { color: colors.textPrimary }]}>
              I'm an Agent or Company
            </Text>

            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              List properties, manage your portfolio, and build trust with the verification badge
            </Text>

            <View style={styles.features}>
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
        <Animated.View entering={FadeInUp.delay(150).springify()}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedRole === 'company' ? colors.primary : colors.border,
                borderWidth: selectedRole === 'company' ? 2 : 1,
              },
            ]}
            onPress={() => handleRoleSelect('company')}
            activeOpacity={0.8}
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

            <View style={styles.features}>
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

        {/* Buyer Card */}
        <Animated.View entering={FadeInUp.delay(200).springify()}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              {
                backgroundColor: colors.card,
                borderColor: selectedRole === 'buyer' ? colors.primary : colors.border,
                borderWidth: selectedRole === 'buyer' ? 2 : 1,
              },
            ]}
            onPress={() => handleRoleSelect('buyer')}
            activeOpacity={0.8}
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

            <View style={styles.features}>
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
                <Ionicons name="checkmark" size={18} color="#000" />
                <Text style={[styles.selectedBadgeText, { color: '#000' }]}>
                  Selected
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Info Box */}
        <Animated.View entering={FadeInUp.delay(300).springify()}>
          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.primary + '10',
                borderColor: colors.primary,
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
          <TouchableOpacity
            style={[
              styles.continueBtn,
              {
                backgroundColor:
                  selectedRole === 'agent' || selectedRole === 'company'
                    ? colors.primary
                    : colors.lime,
              },
            ]}
            onPress={() => {
              if (selectedRole === 'agent' || selectedRole === 'company') {
                setShowCompanyRegistration(true);
              } else {
                handleContinue();
              }
            }}
          >
            <Text
              style={[
                styles.continueBtnText,
                {
                  color:
                    selectedRole === 'agent' || selectedRole === 'company'
                      ? '#FFF'
                      : '#000',
                },
              ]}
            >
              {selectedRole === 'agent'
                ? 'Register Your Company'
                : selectedRole === 'company'
                ? 'Register Your Real Estate Company'
                : 'Continue to Landrush'}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={
                selectedRole === 'agent' || selectedRole === 'company'
                  ? '#FFF'
                  : '#000'
              }
            />
          </TouchableOpacity>
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
      <Ionicons name={icon as any} size={16} color={colors.primary} />
      <Text style={{ fontSize: FontSize.sm, lineHeight: 20, color: colors.textSecondary }}>
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
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
    },
    headerTitle: {
      fontSize: FontSize.xxxl,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      marginBottom: Spacing.sm,
      letterSpacing: LetterSpacing.tight,
    },
    headerSubtitle: {
      fontSize: FontSize.md,
      lineHeight: 22,
    },
    content: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      gap: Spacing.lg,
    },
    roleCard: {
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      gap: Spacing.md,
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
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      letterSpacing: LetterSpacing.snug,
    },
    roleDescription: {
      fontSize: FontSize.sm,
      lineHeight: 20,
    },
    features: {
      gap: Spacing.sm,
      marginVertical: Spacing.md,
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
      borderRadius: BorderRadius.lg,
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
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      borderTopWidth: 1,
      gap: Spacing.md,
    },
    continueBtn: {
      paddingVertical: Spacing.lg,
      borderRadius: BorderRadius.full,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
    },
    continueBtnText: {
      fontSize: FontSize.md,
      fontFamily: FontFamily.semiBold,
      fontWeight: '600',
    },
  });
