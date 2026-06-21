import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth';
import { LandrushLogo } from '../src/components/LandrushLogo';

const SPLASH_BG  = '#004230';
const LOGO_SIZE  = 80;
const CELL       = LOGO_SIZE / 2;
const SPRING     = { tension: 65, friction: 8, useNativeDriver: true };
const OVERSHOOT  = CELL * 3;

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  // One animated value per block — matches the 4-block logo structure
  const topLeftAnim     = useRef(new Animated.Value(-OVERSHOOT)).current; // slides from top
  const bottomLeftAnim  = useRef(new Animated.Value(-OVERSHOOT)).current; // slides from left
  const topRightAnim    = useRef(new Animated.Value(OVERSHOOT)).current;  // slides from right
  const bottomRightAnim = useRef(new Animated.Value(OVERSHOOT)).current;  // slides from right (delayed)
  const textOpacity     = useRef(new Animated.Value(0)).current;
  const textTranslateX  = useRef(new Animated.Value(20)).current;
  const tagOpacity      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Blocks assemble one by one — 120ms stagger, spring snap
    Animated.sequence([
      Animated.delay(200),
      Animated.stagger(120, [
        Animated.spring(topLeftAnim,     { toValue: 0, ...SPRING }),
        Animated.spring(bottomLeftAnim,  { toValue: 0, ...SPRING }),
        Animated.spring(topRightAnim,    { toValue: 0, ...SPRING }),
        Animated.spring(bottomRightAnim, { toValue: 0, ...SPRING }),
      ]),
    ]).start();

    // Text fades + slides in after all 4 blocks land
    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 360,
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
      Animated.delay(1320),
      Animated.timing(tagOpacity, {
        toValue: 1,
        duration: 400,
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
    }, 2900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LandrushLogo
        size={LOGO_SIZE}
        textColor="#8DC63F"
        animated={{
          topLeftAnim,
          bottomLeftAnim,
          topRightAnim,
          bottomRightAnim,
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
