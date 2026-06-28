import React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeOutDown,
  FadeOutUp,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';

export type TransitionDirection = 'up' | 'down' | 'right' | 'left' | 'center' | 'zoom' | 'fade';

interface AdvancedPageTransitionProps {
  children: React.ReactNode;
  direction?: TransitionDirection;
  duration?: number;
  delay?: number;
  exitDirection?: TransitionDirection;
  style?: any;
}

/**
 * Advanced page transitions
 * Different directions based on navigation context
 * Creates more natural, contextual navigation feel
 */
export function AdvancedPageTransition({
  children,
  direction = 'up',
  duration,
  delay = 0,
  exitDirection,
  style,
}: AdvancedPageTransitionProps) {
  const getEnterAnimation = () => {
    const config = duration ? { duration } : undefined;

    switch (direction) {
      case 'up':
        return FadeInUp.delay(delay).springify().damping(12);
      case 'down':
        return FadeInDown.delay(delay).springify().damping(12);
      case 'right':
        return SlideInRight.delay(delay).springify().damping(12);
      case 'left':
        // Slide from left (back navigation)
        return SlideInRight.delay(delay).springify().damping(12);
      case 'zoom':
        return ZoomIn.delay(delay).springify().damping(12);
      case 'fade':
        return FadeIn.delay(delay).duration(duration || 300);
      default:
        return FadeInUp.delay(delay).springify();
    }
  };

  const getExitAnimation = () => {
    const exit = exitDirection || direction;

    switch (exit) {
      case 'up':
        return FadeOutUp.springify().damping(12);
      case 'down':
        return FadeOutDown.springify().damping(12);
      case 'right':
        return SlideOutLeft.springify().damping(12);
      case 'left':
        return SlideOutLeft.springify().damping(12);
      case 'zoom':
        return FadeOutUp.springify().damping(12);
      case 'fade':
        return FadeOutUp.duration(300);
      default:
        return FadeOutDown.springify();
    }
  };

  return (
    <Animated.View
      entering={getEnterAnimation()}
      exiting={getExitAnimation()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Shared element transition
 * Smooth transition between screens with shared elements
 */
export function SharedElementTransition({
  children,
  transitionId,
  style,
}: {
  children: React.ReactNode;
  transitionId?: string;
  style?: any;
}) {
  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12).mass(0.8)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Modal transition
 * Smooth modal entrance and exit
 */
export function ModalTransition({
  children,
  visible,
  onDismiss,
}: {
  children: React.ReactNode;
  visible: boolean;
  onDismiss?: () => void;
}) {
  if (!visible) return null;

  return (
    <Animated.View
      entering={ZoomIn.springify().damping(12).mass(1)}
      exiting={FadeOutDown.springify().damping(12)}
      style={{ flex: 1 }}
    >
      {children}
    </Animated.View>
  );
}

/**
 * Stack transition - for navigation stacks
 * Different animations based on whether pushing or popping
 */
export function StackTransition({
  children,
  isPush = true,
  style,
}: {
  children: React.ReactNode;
  isPush?: boolean;
  style?: any;
}) {
  return (
    <Animated.View
      entering={
        isPush
          ? SlideInRight.springify().damping(12)
          : FadeInUp.springify().damping(12)
      }
      exiting={
        isPush
          ? FadeOutDown.springify()
          : SlideOutLeft.springify().damping(12)
      }
      style={style}
    >
      {children}
    </Animated.View>
  );
}
