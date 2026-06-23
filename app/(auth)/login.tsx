import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Spacing, FontSize, FontFamily, BorderRadius, Shadow, LetterSpacing } from '../../src/constants/theme';
import type { ThemeColors } from '../../src/constants/theme';
import { useColors } from '../../src/context/ThemeContext';
import { LandrushLogo } from '../../src/components/LandrushLogo';
import { useAuthStore } from '../../src/store/auth';
import { loginWithEmail, loginWithGoogle, loginWithApple } from '../../src/services/authService';
import { useGoogleAuth, hasGoogleClientIds } from '../../src/services/googleAuth';
import { signInWithApple, checkAppleAuthAvailable } from '../../src/services/appleAuth';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { setUser } = useAuthStore();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [emailOrPhone, setEmailOrPhone]       = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [biometricType, setBiometricType]     = useState<'face' | 'fingerprint' | null>(null);
  const [appleAvailable, setAppleAvailable]   = useState(false);

  const { request: googleRequest, response: googleResponse, promptAsync: promptGoogle } = useGoogleAuth();

  useEffect(() => {
    (async () => {
      const ok      = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!ok || !enrolled) return;
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) setBiometricType('face');
      else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))   setBiometricType('fingerprint');
    })();
    checkAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  // Handle Google OAuth response
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
      // Client IDs not configured — use mock flow
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

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Log in to Landrush', cancelLabel: 'Cancel' });
    if (result.success) router.replace('/(tabs)');
  };

  const handleLogin = async () => {
    if (!emailOrPhone || !password) { Alert.alert('Missing fields', 'Please fill in all fields.'); return; }
    setIsLoading(true);
    try {
      const { user, token } = await loginWithEmail(emailOrPhone, password);
      setUser(user, token);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Login failed', e?.message ?? 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <LandrushLogo size={28} style={{ marginBottom: Spacing.xl }} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue your land journey</Text>

        {/* Sign up / Log in toggle */}
        <View style={styles.toggle}>
          <TouchableOpacity style={styles.toggleItem} onPress={() => router.replace('/(auth)/signup')}>
            <Text style={styles.toggleText}>Sign Up</Text>
          </TouchableOpacity>
          <View style={[styles.toggleItem, styles.toggleActive]}>
            <Text style={styles.toggleTextActive}>Log In</Text>
          </View>
        </View>

        {/* Social */}
        <View style={styles.socialRow}>
          <TouchableOpacity style={[styles.socialBtn, isSocialLoading === 'google' && styles.socialBtnLoading]} onPress={() => handleGoogleSignIn()} disabled={isSocialLoading !== null}>
            <Ionicons name="logo-google" size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>{isSocialLoading === 'google' ? 'Connecting…' : 'Google'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, isSocialLoading === 'apple' && styles.socialBtnLoading]} onPress={() => handleAppleSignIn()} disabled={isSocialLoading !== null}>
            <Ionicons name="logo-apple" size={18} color={colors.textPrimary} />
            <Text style={styles.socialText}>{isSocialLoading === 'apple' ? 'Connecting…' : 'Apple'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.orRow}>
          <View style={styles.orLine} />
          <Text style={styles.orText}>or continue with email</Text>
          <View style={styles.orLine} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={18} color={colors.textTertiary} />
            <TextInput style={styles.input} value={emailOrPhone} onChangeText={setEmailOrPhone} placeholder="Email or phone number" placeholderTextColor={colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.textTertiary} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.cta, (!emailOrPhone || !password) && styles.ctaDisabled]} onPress={handleLogin} disabled={!emailOrPhone || !password || isLoading}>
            <Text style={styles.ctaText}>{isLoading ? 'Logging in…' : 'Log In'}</Text>
          </TouchableOpacity>

          {biometricType && (
            <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricLogin}>
              <Ionicons name={biometricType === 'face' ? 'scan-outline' : 'finger-print-outline'} size={22} color={colors.primary} />
              <Text style={styles.biometricText}>{biometricType === 'face' ? 'Sign in with Face ID' : 'Sign in with Fingerprint'}</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.signupPrompt}>
            Don't have an account?{' '}
            <Text style={styles.signupLink} onPress={() => router.replace('/(auth)/signup')}>Sign Up</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.white },
    header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
    backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
    body: { flex: 1 },
    bodyContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 48 },
    title: { fontSize: FontSize.xxxl, fontFamily: FontFamily.extraBold, fontWeight: '800', color: colors.textPrimary, letterSpacing: LetterSpacing.tight, marginBottom: Spacing.xs },
    subtitle: { fontSize: FontSize.md, color: colors.textSecondary, marginBottom: Spacing.xxl },
    toggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.xxl },
    toggleItem: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.lg },
    toggleActive: { backgroundColor: colors.white, ...Shadow.sm },
    toggleText: { fontSize: FontSize.md, color: colors.textSecondary, fontWeight: '500' },
    toggleTextActive: { fontSize: FontSize.md, color: colors.textPrimary, fontWeight: '700' },
    socialRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 50, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white },
    socialBtnLoading: { opacity: 0.6, borderColor: colors.lime },
    socialText: { fontSize: FontSize.md, fontWeight: '600', color: colors.textPrimary },
    orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
    orLine: { flex: 1, height: 1, backgroundColor: colors.borderLight },
    orText: { fontSize: FontSize.sm, color: colors.textTertiary },
    form: { gap: Spacing.md },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, height: 52, backgroundColor: colors.white, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: Spacing.lg },
    input: { flex: 1, fontSize: FontSize.md, color: colors.textPrimary },
    forgotRow: { alignItems: 'flex-end', marginTop: -4 },
    forgotText: { fontSize: FontSize.sm, color: colors.textPrimary, fontWeight: '600', textDecorationLine: 'underline' },
    cta: { backgroundColor: colors.lime, height: 54, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
    ctaDisabled: { opacity: 0.5 },
    ctaText: { fontSize: FontSize.lg, fontFamily: FontFamily.bold, fontWeight: '700', color: colors.textPrimary },
    biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: colors.border },
    biometricText: { fontSize: FontSize.md, color: colors.primary, fontWeight: '600' },
    signupPrompt: { textAlign: 'center', fontSize: FontSize.md, color: colors.textSecondary, marginTop: Spacing.sm },
    signupLink: { color: colors.textPrimary, fontWeight: '700', textDecorationLine: 'underline' },
  });
}
