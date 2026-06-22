import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

export default function LoginScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { setUser } = useAuthStore();

  const [emailOrPhone, setEmailOrPhone]       = useState('');
  const [password, setPassword]               = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);
  const [biometricType, setBiometricType]     = useState<'face' | 'fingerprint' | null>(null);

  useEffect(() => {
    (async () => {
      const ok      = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!ok || !enrolled) return;
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) setBiometricType('face');
      else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT))   setBiometricType('fingerprint');
    })();
  }, []);

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    setTimeout(() => {
      setUser({ id: '1', firstName: 'Kenneth', lastName: 'Umoekpe', email: 'kennethumoekpe@gmail.com', phone: '', avatar: '', role: 'seeker', isVerified: true, createdAt: new Date().toISOString() }, 'mock-jwt-token');
      setIsSocialLoading(null);
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleBiometricLogin = async () => {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Log in to Landrush', cancelLabel: 'Cancel' });
    if (result.success) router.replace('/(tabs)');
  };

  const handleLogin = () => {
    if (!emailOrPhone || !password) { Alert.alert('Missing fields', 'Please fill in all fields.'); return; }
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); router.replace('/(tabs)'); }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <Text style={styles.brand}>Landrush</Text>
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
          <TouchableOpacity style={[styles.socialBtn, isSocialLoading === 'google' && styles.socialBtnLoading]} onPress={() => handleSocialSignIn('google')} disabled={isSocialLoading !== null}>
            <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>{isSocialLoading === 'google' ? 'Connecting…' : 'Google'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.socialBtn, isSocialLoading === 'apple' && styles.socialBtnLoading]} onPress={() => handleSocialSignIn('apple')} disabled={isSocialLoading !== null}>
            <Ionicons name="logo-apple" size={18} color={Colors.textPrimary} />
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
            <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} />
            <TextInput style={styles.input} value={emailOrPhone} onChangeText={setEmailOrPhone} placeholder="Email or phone number" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.inputWrap}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} />
            <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={Colors.textTertiary} secureTextEntry={!showPassword} />
            <TouchableOpacity onPress={() => setShowPassword((s) => !s)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.textTertiary} />
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
              <Ionicons name={biometricType === 'face' ? 'scan-outline' : 'finger-print-outline'} size={22} color={Colors.primary} />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: Spacing.xxl, paddingBottom: 48 },
  brand: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.lime, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: Spacing.sm },
  title: { fontSize: FontSize.xxxl, fontWeight: '800', color: Colors.textPrimary, marginBottom: Spacing.xs },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginBottom: Spacing.xxl },
  toggle: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: BorderRadius.xl, padding: 4, marginBottom: Spacing.xxl },
  toggleItem: { flex: 1, paddingVertical: Spacing.md, alignItems: 'center', borderRadius: BorderRadius.lg },
  toggleActive: { backgroundColor: Colors.white, ...Shadow.sm },
  toggleText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '500' },
  toggleTextActive: { fontSize: FontSize.md, color: Colors.textPrimary, fontWeight: '700' },
  socialRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 50, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white },
  socialBtnLoading: { opacity: 0.6, borderColor: Colors.lime },
  socialText: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.xl },
  orLine: { flex: 1, height: 1, backgroundColor: Colors.borderLight },
  orText: { fontSize: FontSize.sm, color: Colors.textTertiary },
  form: { gap: Spacing.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, height: 52, backgroundColor: Colors.white, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.lg },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.textPrimary },
  forgotRow: { alignItems: 'flex-end', marginTop: -4 },
  forgotText: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: '600', textDecorationLine: 'underline' },
  cta: { backgroundColor: Colors.lime, height: 54, borderRadius: BorderRadius.xl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  biometricBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.xl, borderWidth: 1.5, borderColor: Colors.border },
  biometricText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600' },
  signupPrompt: { textAlign: 'center', fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.sm },
  signupLink: { color: Colors.textPrimary, fontWeight: '700', textDecorationLine: 'underline' },
});
