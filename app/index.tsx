import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth';

const { width } = Dimensions.get('window');

const MARK_DARK = '#1A5C3A';
const MARK_LIGHT = '#8DC63F';
const SPLASH_BG = '#004230';
const TEXT_COLOR = '#9FBB44';

const SIZE = 80;
const CELL = SIZE / 2;
const GAP = Math.round(SIZE * 0.08);
const RADIUS = Math.round(CELL * 0.22);

const SPRING = { tension: 65, friction: 8, useNativeDriver: true };

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, hasCompletedOnboarding } = useAuthStore();

  // Each block has its own translate value
  const topLeftY    = useRef(new Animated.Value(-(CELL * 3))).current;
  const bottomLeftX = useRef(new Animated.Value(-(CELL * 3))).current;
  const rightX      = useRef(new Animated.Value(CELL * 3)).current;

  // Text
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textX       = useRef(new Animated.Value(20)).current;

  // Tagline
  const tagOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(250),

      // Three blocks stagger in
      Animated.stagger(130, [
        Animated.spring(topLeftY,    { toValue: 0, ...SPRING }),
        Animated.spring(bottomLeftX, { toValue: 0, ...SPRING }),
        Animated.spring(rightX,      { toValue: 0, ...SPRING }),
      ]),
    ]).start();

    // Text slides in slightly after blocks land
    Animated.sequence([
      Animated.delay(820),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 380,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(textX, {
          toValue: 0,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tagline appears last
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
      <View style={styles.logoRow}>
        {/* Left column */}
        <View style={{ gap: GAP }}>
          {/* Top-left block — slides in from top */}
          <Animated.View
            style={{
              width: CELL,
              height: CELL,
              backgroundColor: MARK_DARK,
              borderRadius: RADIUS,
              transform: [{ translateY: topLeftY }],
            }}
          />

          {/* Bottom-left block — slides in from left */}
          <Animated.View
            style={{ transform: [{ translateX: bottomLeftX }] }}
          >
            <View
              style={{
                width: CELL,
                height: CELL,
                backgroundColor: MARK_LIGHT,
                borderRadius: RADIUS,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  bottom: CELL * 0.35,
                  left: -CELL * 0.15,
                  width: CELL * 1.3,
                  height: CELL * 0.55,
                  backgroundColor: 'rgba(255,255,255,0.28)',
                  borderRadius: CELL * 0.8,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: CELL * 0.15,
                  left: -CELL * 0.15,
                  width: CELL * 1.3,
                  height: CELL * 0.55,
                  backgroundColor: 'rgba(255,255,255,0.18)',
                  borderRadius: CELL * 0.8,
                }}
              />
            </View>
          </Animated.View>
        </View>

        {/* Right tall block — slides in from right */}
        <Animated.View
          style={{
            width: CELL,
            height: CELL * 2 + GAP,
            backgroundColor: MARK_DARK,
            borderRadius: RADIUS,
            transform: [{ translateX: rightX }],
          }}
        />

        {/* Text block — fades + slides in */}
        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: textOpacity,
              transform: [{ translateX: textX }],
            },
          ]}
        >
          <Text style={[styles.wordText, { fontSize: SIZE * 0.36, lineHeight: SIZE * 0.44 }]}>
            LAND
          </Text>
          <Text style={[styles.wordText, { fontSize: SIZE * 0.36, lineHeight: SIZE * 0.44 }]}>
            RUSH
          </Text>
        </Animated.View>
      </View>

      {/* Tagline */}
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  },
  textBlock: {
    marginLeft: SIZE * 0.14,
  },
  wordText: {
    fontWeight: '800',
    color: TEXT_COLOR,
    letterSpacing: SIZE * 0.018,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
