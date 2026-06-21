import React, { useState } from 'react';
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
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { LandrushLogo } from '../../src/components/LandrushLogo';
import { useAuthStore } from '../../src/store/auth';

export default function SignupScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<'google' | 'apple' | null>(null);

  const handleSocialSignIn = (provider: 'google' | 'apple') => {
    setIsSocialLoading(provider);
    setTimeout(() => {
      setUser(
        {
          id: '1',
          firstName: 'Kenneth',
          lastName: 'Umoekpe',
          email: 'kennethumoekpe@gmail.com',
          phone: '',
          avatar: 'https://i.pravatar.cc/150?img=11',
          role: 'seeker',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        'mock-jwt-token',
      );
      setIsSocialLoading(null);
      router.replace('/(tabs)');
    }, 1200);
  };

  const handleSignup = () => {
    if (!emailOrPhone || !password || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push({ pathname: '/(auth)/verify-otp', params: { phone: emailOrPhone } });
    }, 1000);
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
          <Ionicons name="chevron-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <LandrushLogo size={52} textColor="#8DC63F" />
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
            onPress={() => handleSocialSignIn('google')}
            disabled={isSocialLoading !== null}
          >
            <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>
              {isSocialLoading === 'google' ? 'Connecting…' : 'Google'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialBtn, isSocialLoading === 'apple' && styles.socialBtnLoading]}
            onPress={() => handleSocialSignIn('apple')}
            disabled={isSocialLoading !== null}
          >
            <Ionicons name="logo-apple" size={18} color={Colors.textPrimary} />
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
            <Ionicons name="mail-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              placeholder="Email or Phone Number"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textTertiary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm Password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeBtn}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textTertiary}
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

const HEADER_BG = '#003828';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HEADER_BG,
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
    backgroundColor: 'rgba(159,187,68,0.08)',
    top: -50,
    right: -50,
  },
  decoCircleSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(159,187,68,0.06)',
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
    fontWeight: '800',
    color: Colors.white,
    marginTop: Spacing.md,
  },
  headerSub: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.6)',
  },
  card: {
    flex: 1,
    backgroundColor: Colors.white,
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
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabDivider: {
    width: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 6,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  tabTextActive: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
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
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  socialBtnLoading: {
    opacity: 0.65,
    borderColor: Colors.lime,
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
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  form: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryBtn: {
    backgroundColor: Colors.lime,
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
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  termsText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    lineHeight: 20,
  },
  termsLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  loginPrompt: {
    textAlign: 'center',
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
