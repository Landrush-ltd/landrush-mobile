import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface AnimatedHeartProps {
  isSaved: boolean;
  onPress: () => void;
  size?: number;
  color?: string;
  savedColor?: string;
}

export function AnimatedHeart({
  isSaved,
  onPress,
  size = 24,
  color = '#999',
  savedColor = '#FF3B30',
}: AnimatedHeartProps) {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(isSaved ? 1 : 0);

  const handlePress = () => {
    // Pulse animation on save/unsave
    scale.value = withSpring(1.3, {
      damping: 8,
      mass: 0.6,
      overshootClamping: false,
    });

    // Heart scale animation
    if (!isSaved) {
      heartScale.value = withSpring(1, {
        damping: 10,
        mass: 0.8,
      });
    } else {
      heartScale.value = withTiming(0, {
        duration: 150,
        easing: Easing.out(Easing.ease),
      });
    }

    setTimeout(() => {
      scale.value = withTiming(1, { duration: 200 });
    }, 100);

    onPress();
  };

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
    opacity: heartScale.value,
  }));

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={1}>
      <Animated.View style={pulseStyle}>
        <View style={{ position: 'relative', width: size, height: size }}>
          {/* Outline heart (unfilled) */}
          {!isSaved && (
            <Ionicons
              name="heart-outline"
              size={size}
              color={color}
              style={{ position: 'absolute' }}
            />
          )}

          {/* Filled heart (animated in) */}
          <Animated.View style={[{ position: 'absolute' }, heartStyle]}>
            <Ionicons name="heart" size={size} color={savedColor} />
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}
