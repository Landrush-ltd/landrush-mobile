import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth';
import { LandrushLogo } from '../src/components/LandrushLogo';

const SPLASH_BG = '#004230';
const SPRING = { tension: 65, friction: 8, useNativeDriver: true };
const LOGO_SIZE = 80;
const CELL = LOGO_SIZE / 2;

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  // Per-block animated values — passed into LandrushLogo
  const topLeftAnim    = useRef(new Animated.Value(-(CELL * 3))).current;
  const bottomLeftAnim = useRef(new Animated.Value(-(CELL * 3))).current;
  const rightAnim      = useRef(new Animated.Value(CELL * 3)).current;
  const textOpacity    = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(20)).current;
  const tagOpacity     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blocks assemble with stagger
    Animated.sequence([
      Animated.delay(250),
      Animated.stagger(130, [
        Animated.spring(topLeftAnim,    { toValue: 0, ...SPRING }),
        Animated.spring(bottomLeftAnim, { toValue: 0, ...SPRING }),
        Animated.spring(rightAnim,      { toValue: 0, ...SPRING }),
      ]),
    ]).start();

    // Text slides in after blocks land
    Animated.sequence([
      Animated.delay(820),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textTranslateX, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tagline fades in last
    Animated.sequence([
      Animated.delay(1260),
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else if (hasCompletedOnboarding) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LandrushLogo
        size={LOGO_SIZE}
        textColor="#9FBB44"
        animated={{
          topLeftAnim,
          bottomLeftAnim,
          rightAnim,
          textOpacity,
          textTranslateX,
        }}
      />

      <Animated.Text style={[styles.tagline, { opacity: tagOpacity }]}>
        Your land. Your future.
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: SPLASH_BG,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
