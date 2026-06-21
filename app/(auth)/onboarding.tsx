import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

const { width } = Dimensions.get('window');

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Slide {
  icon:        IoniconsName;
  iconBg:      string;
  eyebrow:     string;
  title:       string;
  description: string;
  features:    string[];
}

const SLIDES: Slide[] = [
  {
    icon:        'search-outline',
    iconBg:      `${Colors.lime}25`,
    eyebrow:     'DISCOVER',
    title:       'Find land that fits your vision',
    description: 'Search verified listings across all 36 states. Filter by type, size, price range, and location.',
    features:    ['36 states covered', 'All land types', 'Verified listings only'],
  },
  {
    icon:        'shield-checkmark-outline',
    iconBg:      'rgba(21,101,192,0.18)',
    eyebrow:     'TRUST',
    title:       'Know before you commit',
    description: 'Every listing shows document status, map location, and agent verification — no surprises.',
    features:    ['Title documents', 'NIMC-verified agents', 'Satellite map view'],
  },
  {
    icon:        'calendar-outline',
    iconBg:      `${Colors.lime}25`,
    eyebrow:     'INSPECT',
    title:       'Book inspections on your terms',
    description: 'Choose your date and time. The agent confirms directly — no phone tag, no middlemen.',
    features:    ['Flexible scheduling', 'Direct agent contact', 'Instant confirmation'],
  },
];

const DECO_CIRCLES = [
  { size: 280, top: -100, right: -80,  opacity: 0.06 },
  { size: 160, top: 120,  left: -60,   opacity: 0.04 },
  { size: 100, bottom: 80, right: 30,  opacity: 0.05 },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setOnboardingComplete } = useAuthStore();
  const [idx, setIdx] = useState(0);
  const fadeAnim  = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const goTo = (next: number) => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 0,   duration: 160, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -24, duration: 160, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 160, useNativeDriver: true }),
    ]).start(() => {
      setIdx(next);
      slideAnim.setValue(24);
      scaleAnim.setValue(1.02);
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (idx < SLIDES.length - 1) {
      goTo(idx + 1);
    } else {
      finish();
    }
  };

  const finish = () => {
    setOnboardingComplete();
    router.replace('/(auth)/login');
  };

  const slide = SLIDES[idx];
  const isLast = idx === SLIDES.length - 1;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Background */}
      <LinearGradient
        colors={['#002A1E', '#003828', '#004530']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Deco circles */}
      {DECO_CIRCLES.map((c, i) => (
        <View
          key={i}
          style={[
            styles.decoCircle,
            {
              width: c.size, height: c.size, borderRadius: c.size / 2,
              opacity: c.opacity,
              ...(c.top    !== undefined ? { top:    c.top    } : {}),
              ...(c.bottom !== undefined ? { bottom: c.bottom } : {}),
              ...(c.left   !== undefined ? { left:   c.left   } : {}),
              ...(c.right  !== undefined ? { right:  c.right  } : {}),
            },
          ]}
        />
      ))}

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity:   fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: slide.iconBg }]}>
          <Ionicons name={slide.icon} size={44} color={Colors.lime} />
        </View>

        {/* Eyebrow */}
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>

        {/* Title */}
        <Text style={styles.title}>{slide.title}</Text>

        {/* Description */}
        <Text style={styles.description}>{slide.description}</Text>

        {/* Feature list */}
        <View style={styles.features}>
          {slide.features.map((f) => (
            <View key={f} style={styles.featureRow}>
              <View style={styles.featureDot} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Bottom */}
      <View style={styles.bottom}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => i !== idx && goTo(i)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Animated.View
                style={[
                  styles.dot,
                  i === idx ? styles.dotActive : styles.dotInactive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.cta, isLast && styles.ctaLast]}
          onPress={handleNext}
          activeOpacity={0.88}
        >
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          <Ionicons
            name={isLast ? 'checkmark' : 'arrow-forward'}
            size={20}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>

        {/* Already have account */}
        {isLast && (
          <TouchableOpacity onPress={finish} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={styles.loginLinkBold}>Log in</Text></Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: Spacing.xxl,
  },
  decoCircle: {
    position: 'absolute',
    backgroundColor: Colors.lime,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.xxl,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skipText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 80,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
    borderWidth: 1,
    borderColor: `${Colors.lime}30`,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.lime,
    letterSpacing: 2.5,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.white,
    lineHeight: 38,
    marginBottom: Spacing.lg,
  },
  description: {
    fontSize: FontSize.md,
    color: 'rgba(255,255,255,0.62)',
    lineHeight: 24,
    marginBottom: Spacing.xxl,
  },
  features: {
    gap: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.lime,
  },
  featureText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },

  // Bottom
  bottom: {
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.lime,
  },
  dotInactive: {
    width: 5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cta: {
    backgroundColor: Colors.lime,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.xl,
    gap: Spacing.sm,
  },
  ctaLast: {
    backgroundColor: Colors.lime,
  },
  ctaText: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  loginLink: {
    alignSelf: 'center',
  },
  loginLinkText: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.5)',
  },
  loginLinkBold: {
    color: Colors.lime,
    fontWeight: '700',
  },
});
