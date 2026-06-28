import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  FadeIn,
} from 'react-native-reanimated';
import { Shadow, BorderRadius, Spacing } from '../constants/theme';

interface GestureCardProps {
  children: React.ReactNode;
  onLongPress?: () => void;
  onPress?: () => void;
  style?: any;
  disabled?: boolean;
}

export function GestureCard({
  children,
  onLongPress,
  onPress,
  style,
  disabled = false,
}: GestureCardProps) {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const scale = useSharedValue(1);
  const elevation = useSharedValue(0);

  const handlePressIn = () => {
    if (!disabled) {
      scale.value = withTiming(0.98, {
        duration: 100,
        easing: Easing.out(Easing.ease),
      });
      elevation.value = withTiming(0.5, {
        duration: 100,
      });
    }
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: 100,
      easing: Easing.out(Easing.ease),
    });
    elevation.value = withTiming(1, {
      duration: 100,
    });
    setIsLongPressing(false);
  };

  const handleLongPress = () => {
    setIsLongPressing(true);
    if (onLongPress) {
      onLongPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: elevation.value * 0.3,
  }));

  return (
    <Animated.View
      entering={FadeIn.springify()}
      style={[
        animatedStyle,
        style,
        {
          overflow: 'hidden',
          borderRadius: BorderRadius.lg,
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        onPress={!isLongPressing ? onPress : undefined}
        disabled={disabled}
        style={styles.pressable}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
  },
});
