import React, { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface SwipeBackGestureProps {
  children: React.ReactNode;
  enabled?: boolean;
}

/**
 * Swipe back gesture handler
 * Enables swiping from left edge to go back
 * Follows Emil's philosophy: natural, interruptible gesture
 */
export function SwipeBackGesture({
  children,
  enabled = true,
}: SwipeBackGestureProps) {
  const router = useRouter();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const pan = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX(-10)
    .failOffsetY([-5, 5])
    .onUpdate((e) => {
      if (e.translationX > 0 && e.translationX < 150) {
        translateX.value = e.translationX;
        opacity.value = 1 - e.translationX / 150;
      }
    })
    .onFinalize((e) => {
      // If swiped more than 50px or velocity is high, go back
      if (e.translationX > 50 || e.velocityX > 500) {
        translateX.value = withSpring(300, {
          damping: 10,
          mass: 0.8,
        });
        setTimeout(() => {
          router.back();
        }, 200);
      } else {
        // Snap back
        translateX.value = withSpring(0, {
          damping: 12,
          mass: 1,
        });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
