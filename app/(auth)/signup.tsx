import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, FontSize, FontFamily, BorderRadius, LetterSpacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { LandrushLogo } from '../../src/components/LandrushLogo';
import { useAuthStore } from '../../src/store/auth';
import { signupWithEmail, loginWithGoogle, loginWithApple } from '../../src/services/authService';
import { useGoogleAuth, hasGoogleClientIds } from '../../src/services/googleAuth';
import { signInWithApple, checkAppleAuthAvailable } from '../../src/services/appleAuth';

export default function SignupScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);
  const { request: googleRequest, response: googleResponse, promptAsync: promptGoogle } = useGoogleAuth();

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const accessToken = googleResponse.authentication?.accessToken;
    if (!accessToken) return;
    setIsSocialLoading('google');
    loginWithGoogle(accessToken)
      .then(({ user, token }) => { setUser(user, token); router.replace('/(tabs)'); })
      .catch((e) => Alert.alert('Google sign in failed', e?.message ?? 'Please try again.'))
      .finally(() => setIsSocialLoading(null));
  }, [googleResponse]);

  const handleGoogleSignIn = () => {
    if (!hasGoogleClientIds) {
      setIsSocialLoading('google');
      loginWithGoogle('mock-access-token')
        .then(({ user, token }) => { setUser(user, token); router.replace('/(tabs)'); })
        .catch((e) => Alert.alert('Sign in failed', e?.message ?? 'Please try again.'))
        .finally(() => setIsSocialLoading(null));
      return;
    }
    promptGoogle();
  };

  const handleAppleSignIn = async () => {
    setIsSocialLoading('apple');
    try {
      const appleUser = await signInWithApple();
      const { user, token } = await loginWithApple(
        appleUser.identityToken ?? '',
        appleUser.email,
        appleUser.fullName,
      );
      setUser(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Apple sign in failed', e?.message ?? 'Please try again.');
      }
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleSignup = async () => {
    if (!emailOrPhone || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    try {
      await signupWithEmail(emailOrPhone, password);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone: emailOrPhone } });
    } catch (e: any) {
      Alert.alert('Sign up failed', e?.message ?? 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Dark green header with decorative flair */}
      <View style={styles.header}>
        <View style={styles.decoCircleLarge} />
        <View style={styles.decoCircleSmall} />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <LandrushLogo size={28} />
        <Text style={styles.headerTitle}>Create account</Text>
        <Text style={styles.headerSub}>Join thousands finding land across Nigeria</Text>
      </View>

      {/* White form card */}
      <ScrollView
        style={styles.card}
        contentContainerStyle={styles.cardContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sign Up / Log in toggle */}
        <View style={styles.tabRow}>
          <View style={[styles.tabItem, styles.tabActive]}>
            <Text style={styles.tabTextActive}>Sign Up</Text>
          </View>
          <View style={styles.tabDivider} />
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text style={styles.tabText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Social buttons */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialBtn, isSocialLoading === 'google' && styles.socialBtnLoading]}
            onPress={() => handleGoogleSignIn()}
            disabled={isSocialLoading !== null}
          >
            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>
              {isSocialLoading === 'google' ? 'Connecting…' : 'Google'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, isSocialLoading === 'apple' && styles.socialBtnLoading]}
            onPress={() => handleAppleSignIn()}
            disabled={isSocialLoading !== null}
          >
            <Ionicons name="logo-apple" size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>
              {isSocialLoading === 'apple' ? 'Connecting…' : 'Apple'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with email</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Email or Phone Number"
              placeholderTextColor={colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (!emailOrPhone || !password || !confirmPassword) && styles.primaryBtnDisabled,
            ]}
            onPress={handleSignup}
            disabled={!emailOrPhone || !password || !confirmPassword || isLoading}
          >
            <Text style={styles.primaryBtnText}>
              {isLoading ? 'Creating account…' : 'Create Account'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing up, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>

          <Text style={styles.loginPrompt}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => router.replace('/(auth)/login')}>
              Log In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.white,
    },
    header: {
      paddingTop: 56,
      paddingHorizontal: Spacing.xxl,
      paddingBottom: Spacing.xxxl,
      gap: Spacing.sm,
      overflow: 'hidden',
    },
    decoCircleLarge: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      backgroundColor: 'transparent',
      top: -50,
      right: -50,
    },
    decoCircleSmall: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'transparent',
      bottom: 16,
      right: 50,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: BorderRadius.md,
      backgroundColor: 'rgba(255,255,255,0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
    },
    headerTitle: {
      fontSize: FontSize.display,
      fontFamily: FontFamily.extraBold,
      fontWeight: '800',
      color: colors.white,
      letterSpacing: LetterSpacing.tight,
      marginTop: Spacing.md,
    },
    headerSub: {
      fontSize: FontSize.md,
      color: colors.textSecondary,
    },
    card: {
      flex: 1,
      backgroundColor: colors.white,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
    },
    cardContent: {
      paddingHorizontal: Spacing.xxl,
      paddingTop: Spacing.xxl,
      paddingBottom: 48,
    },
    tabRow: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      padding: 4,
      marginBottom: Spacing.xxl,
    },
    tabItem: {
      flex: 1,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      borderRadius: BorderRadius.lg,
    },
    tabActive: {
      backgroundColor: colors.white,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    tabDivider: {
      width: 1,
      backgroundColor: colors.borderLight,
      marginVertical: 6,
    },
    tabText: {
      fontSize: FontSize.md,
      color: colors.textTertiary,
      fontWeight: '500',
    },
    tabTextActive: {
      fontSize: FontSize.md,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    socialRow: {
      flexDirection: 'row',
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    socialBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      height: 48,
      borderRadius: BorderRadius.xl,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    socialText: {
      fontSize: FontSize.md,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    socialBtnLoading: {
      opacity: 0.65,
      borderColor: colors.lime,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.borderLight,
    },
    dividerText: {
      fontSize: FontSize.sm,
      color: colors.textTertiary,
    },
    form: {
      gap: Spacing.md,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 52,
      backgroundColor: colors.background,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: Spacing.lg,
    },
    inputIcon: {
      marginRight: Spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: FontSize.md,
      color: colors.textPrimary,
    },
    eyeBtn: {
      padding: 4,
    },
    primaryBtn: {
      backgroundColor: colors.lime,
      height: 52,
      borderRadius: BorderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.sm,
    },
    primaryBtnDisabled: {
      opacity: 0.55,
    },
    primaryBtnText: {
      fontSize: FontSize.lg,
      fontFamily: FontFamily.bold,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    termsText: {
      textAlign: 'center',
      fontSize: FontSize.sm,
      color: colors.textTertiary,
      lineHeight: 20,
    },
    termsLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    loginPrompt: {
      textAlign: 'center',
      fontSize: FontSize.md,
      color: colors.textSecondary,
    },
    loginLink: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
}
