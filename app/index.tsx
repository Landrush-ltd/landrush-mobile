import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSize, Spacing } from '../src/constants/theme';
import { useAuthStore } from '../src/store/auth';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else if (hasCompletedOnboarding) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoLeaf1} />
        <View style={styles.logoLeaf2} />
      </View>
      <Text style={styles.title}>Landrush</Text>
      <Text style={styles.tagline}>Discover. Verify. Connect.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.onboardingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  logoLeaf1: {
    position: 'absolute',
    width: 36,
    height: 52,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    left: 10,
    top: 5,
    transform: [{ rotate: '-15deg' }],
  },
  logoLeaf2: {
    position: 'absolute',
    width: 36,
    height: 52,
    backgroundColor: Colors.primaryLight,
    borderRadius: 18,
    right: 10,
    top: 12,
    transform: [{ rotate: '15deg' }],
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
});
