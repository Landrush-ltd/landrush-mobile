import { useState, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Animated, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth';

const { width } = Dimensions.get('window');

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface Slide {
  icon:        IoniconsName;
  eyebrow:     string;
  title:       string;
  description: string;
  accent:      string;
}

const SLIDES: Slide[] = [
  {
    icon:        'search-outline',
    eyebrow:     'DISCOVER',
    title:       'Find land across Nigeria',
    description: 'Search verified listings in all 36 states. Filter by type, size, price, and location to find exactly what fits.',
    accent:      Colors.lime,
  },
  {
    icon:        'shield-checkmark-outline',
    eyebrow:     'TRUST',
    title:       'Know before you commit',
    description: 'Every listing shows document status, satellite map, and NIMC-verified agent info — no surprises at the inspection.',
    accent:      '#40916C',
  },
  {
    icon:        'calendar-outline',
    eyebrow:     'INSPECT',
    title:       'Book on your schedule',
    description: 'Pick a date and time. The agent confirms directly — no phone tag, no middlemen, no wasted trips.',
    accent:      Colors.lime,
  },
];

export default function OnboardingScreen() {
  const router   = useRouter();
  const insets   = useSafeAreaInsets();
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
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 24) }]}>
      <StatusBar barStyle="dark-content" />

      {/* Skip */}
      <TouchableOpacity style={styles.skipBtn} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Illustration area */}
      <Animated.View style={[styles.illustrationWrap, { opacity: fadeAnim, transform: [{ translateY: transAnim }] }]}>
        <View style={[styles.iconCircleOuter, { borderColor: `${slide.accent}30` }]}>
          <View style={[styles.iconCircleInner, { backgroundColor: `${slide.accent}15` }]}>
            <Ionicons name={slide.icon} size={56} color={slide.accent} />
          </View>
        </View>
        <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => i !== idx && goTo(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <View style={[styles.dot, i === idx ? styles.dotActive : styles.dotInactive]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cta} onPress={isLast ? finish : () => goTo(idx + 1)} activeOpacity={0.88}>
          <Text style={styles.ctaText}>{isLast ? 'Get Started' : 'Continue'}</Text>
          <Ionicons name={isLast ? 'checkmark' : 'arrow-forward'} size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        {isLast && (
          <TouchableOpacity onPress={finish} style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? <Text style={styles.loginLink}>Log in</Text></Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: Spacing.xxl },
  skipBtn: { alignSelf: 'flex-end', paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, marginTop: Spacing.md },
  skipText: { fontSize: FontSize.md, color: Colors.textSecondary, fontWeight: '500', textDecorationLine: 'underline' },
  illustrationWrap: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', paddingBottom: Spacing.xxl },
  iconCircleOuter: { width: 120, height: 120, borderRadius: 60, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.xxxl },
  iconCircleInner: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontSize: FontSize.xs, fontWeight: '700', color: Colors.lime, letterSpacing: 2.5, marginBottom: Spacing.md },
  title: { fontSize: FontSize.display, fontWeight: '800', color: Colors.textPrimary, lineHeight: 40, marginBottom: Spacing.lg },
  description: { fontSize: FontSize.lg, color: Colors.textSecondary, lineHeight: 26 },
  dotsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, alignSelf: 'center' },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 28, backgroundColor: Colors.textPrimary },
  dotInactive: { width: 5, backgroundColor: Colors.border },
  footer: { gap: Spacing.lg },
  cta: { backgroundColor: Colors.lime, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl, borderRadius: BorderRadius.xl, gap: Spacing.sm },
  ctaText: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.textPrimary },
  loginRow: { alignSelf: 'center' },
  loginText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  loginLink: { color: Colors.textPrimary, fontWeight: '700', textDecorationLine: 'underline' },
});
