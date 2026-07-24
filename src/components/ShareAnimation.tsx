import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';

interface ShareAnimationProps {
  duration?: number;
  onComplete?: () => void;
}

/**
 * Animated share success - cards spread out in a circle
 * Creates a delightful celebration when user shares
 */
export function ShareAnimation({
  duration = 2000,
  onComplete,
}: ShareAnimationProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.inOut(Easing.ease),
    });

    const timer = setTimeout(() => {
      onComplete?.();
    }, duration + 200);

    return () => clearTimeout(timer);
  }, []);

  const renderCard = (index: number, icon: string, color: string) => {
    const angle = (index / 3) * Math.PI * 2;
    const radius = 80;

    const cardStyle = useAnimatedStyle(() => {
      const x = Math.cos(angle) * radius * progress.value;
      const y = Math.sin(angle) * radius * progress.value;
      const opacity = progress.value;
      const scale = interpolate(progress.value, [0, 0.5, 1], [0, 1.2, 1], Extrapolate.CLAMP);

      return {
        transform: [
          { translateX: x },
          { translateY: y },
          { scale },
        ],
        opacity,
      };
    });

    return (
      <Animated.View
        key={index}
        style={[
          styles.card,
          { backgroundColor: color + '20', borderColor: color },
          cardStyle,
        ]}
      >
        <Ionicons name={icon as any} size={28} color={color} />
      </Animated.View>
    );
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.center}>
        {/* Center check icon */}
        <Animated.View
          style={useAnimatedStyle(() => ({
            opacity: progress.value,
            transform: [
              {
                scale: interpolate(
                  progress.value,
                  [0, 0.6, 1],
                  [2, 1.2, 1],
                  Extrapolate.CLAMP
                ),
              },
            ],
          }))}
        >
          <View style={[styles.centerIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={40} color="#FFFFFF" />
          </View>
        </Animated.View>

        {/* Spreading cards */}
        {renderCard(0, 'logo-whatsapp', '#25D366')}
        {renderCard(1, 'logo-facebook', '#1877F2')}
        {renderCard(2, 'logo-twitter', '#000000')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    width: 250,
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
});
