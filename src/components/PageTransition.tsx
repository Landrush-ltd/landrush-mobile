import React from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';

export type TransitionType = 'fadeUp' | 'zoom' | 'fade' | 'none';

interface PageTransitionProps {
  children: React.ReactNode;
  type?: TransitionType;
  delay?: number;
  duration?: number;
  style?: any;
}

export function PageTransition({
  children,
  type = 'fadeUp',
  delay = 0,
  duration = 400,
  style,
}: PageTransitionProps) {
  const getEntryAnimation = () => {
    switch (type) {
      case 'fadeUp':
        return FadeInUp.delay(delay).springify().damping(12).mass(1);
      case 'zoom':
        return ZoomIn.delay(delay).springify().damping(14).mass(1);
      case 'fade':
        return FadeIn.delay(delay).duration(duration);
      case 'none':
        return undefined;
      default:
        return FadeInUp.delay(delay).springify();
    }
  };

  if (type === 'none') {
    return <View style={style}>{children}</View>;
  }

  return (
    <Animated.View
      entering={getEntryAnimation()}
      exiting={FadeOutDown.springify()}
      style={style}
    >
      {children}
    </Animated.View>
  );
}
