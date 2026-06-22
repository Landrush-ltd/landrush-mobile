import { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  Animated, StatusBar, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

const { width, height } = Dimensions.get('window');
const IMG_HEIGHT = height * 0.52;

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',
    eyebrow: 'DISCOVER',
    title: 'Find land that fits your vision',
    description: 'Search verified land listings across Nigeria. Filter by type, price, location, and size to find exactly what you need.',
  },
  {
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
    eyebrow: 'TRUST',
    title: 'Know before you commit',
    description: 'View listing details, uploaded documents, map locations, and verification indicators before scheduling an inspection.',
  },
  {
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800',
    eyebrow: 'INSPECT',
    title: 'Book on your schedule',
    description: 'Coordinate inspection times directly with agents — no unnecessary back-and-forth, no wasted trips.',
  },
];

export default function OnboardingScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { setOnboardingComplete } = useAuthStore();
  const [idx, setIdx] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const transAnim = useRef(new Animated.Value(0)).current;

  const goTo = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(transAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
    ]).start(() => {
      setIdx(next);
      transAnim.setValue(20);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(transAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const finish = () => { setOnboardingComplete(); router.replace('/(auth)/login'); };
  const slide  = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Full-width photo */}
      <Animated.View style={[styles.imageWrap, { opacity: fadeAnim }]}>
        <Image source={{ uri: slide.image }} style={styles.image} resizeMode="cover" />
        {/* Skip button floated on top of image */}
        <TouchableOpacity
          style={[styles.skipBtn, { top: insets.top + Spacing.md }]}
          onPress={finish}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Text content */}
      <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, 28) }]}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: transAnim }] }}>
          <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </Animated.View>

        {/* Dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => i !== idx && goTo(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View style={[styles.dot, i === idx ? styles.dotActive : styles.dotInactive]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={styles.cta}
          onPress={isLast ? finish : () => goTo(idx + 1)}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        {isLast && (
          <TouchableOpacity onPress={finish} style={styles.loginRow}>
            <Text style={styles.loginText}>
              Already have an account?{' '}
              <Text style={styles.loginLink}>Log in</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white },

  imageWrap: {
    width,
    height: IMG_HEIGHT,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  skipBtn: {
    position: 'absolute',
    right: Spacing.lg,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: BorderRadius.full,
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.white,
    fontWeight: '600',
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxl,
    gap: Spacing.lg,
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: 2.5,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 40,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 24,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 28, backgroundColor: Colors.textPrimary },
  dotInactive: { width: 5, backgroundColor: Colors.border },

  cta: {
    backgroundColor: Colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  ctaText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },

  loginRow: { alignSelf: 'center' },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.textPrimary, fontWeight: '700', textDecorationLine: 'underline' },
});
