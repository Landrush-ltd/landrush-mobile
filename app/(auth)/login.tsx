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
import { Colors, Spacing, FontSize, BorderRadius, Shadow } from '../../src/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('login');

  const handleLogin = () => {
    if (!emailOrPhone || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  if (activeTab === 'signup') {
    router.push('/(auth)/signup');
    setActiveTab('login');
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoLeaf1} />
            <View style={styles.logoLeaf2} />
          </View>
          <Text style={styles.welcomeText}>Welcome</Text>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
            onPress={() => setActiveTab('signup')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'signup' && styles.activeTabText,
              ]}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.activeTab]}
            onPress={() => setActiveTab('login')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'login' && styles.activeTabText,
              ]}
            >
              Log in
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.socialRow}>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={18} color={Colors.textPrimary} />
            <Text style={styles.socialText}>Apple</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.orText}>or Continue with</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            placeholder="Enter Email or Phone Number"
            placeholderTextColor={Colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
              placeholderTextColor={Colors.textTertiary}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.loginButton, (!emailOrPhone || !password) && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={!emailOrPhone || !password || isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Log in'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0EDDF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: 60,
    paddingBottom: Spacing.xxxl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  logoContainer: {
    width: 60,
    height: 60,
    marginBottom: Spacing.lg,
    position: 'relative',
  },
  logoLeaf1: {
    position: 'absolute',
    width: 28,
    height: 40,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    left: 8,
    top: 5,
    transform: [{ rotate: '-15deg' }],
  },
  logoLeaf2: {
    position: 'absolute',
    width: 28,
    height: 40,
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    right: 8,
    top: 10,
    transform: [{ rotate: '15deg' }],
  },
  welcomeText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  activeTab: {
    backgroundColor: Colors.chipActive,
  },
  tabText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 48,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialText: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  orText: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.lg,
  },
  form: {
    gap: Spacing.lg,
  },
  input: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  passwordInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },
  showText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    height: 52,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.white,
  },
  forgotPassword: {
    alignItems: 'center',
  },
  forgotText: {
    fontSize: FontSize.md,
    color: Colors.primary,
    fontWeight: '600',
  },
});
