import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { Spacing, BorderRadius } from '../constants/theme';
import { selectionFeedback } from '../utils/haptics';

export interface Tab {
  name: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

/**
 * Tab selector with selection feedback
 * Haptic pulse on selection change
 * Smooth scale animation
 */
export function TabSelector({
  tabs,
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  const colors = useColors();

  const handleTabPress = async (tabName: string) => {
    if (tabName !== activeTab) {
      await selectionFeedback();
      onTabChange(tabName);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        const scale = useSharedValue(isActive ? 1 : 0.8);

        React.useEffect(() => {
          scale.value = withSpring(isActive ? 1 : 0.8, {
            damping: 12,
            mass: 1,
          });
        }, [isActive]);

        const animatedStyle = useAnimatedStyle(() => ({
          transform: [{ scale: scale.value }],
        }));

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => handleTabPress(tab.name)}
            activeOpacity={0.7}
          >
            <Animated.View style={animatedStyle}>
              <View
                style={[
                  styles.iconContainer,
                  isActive && {
                    backgroundColor: colors.primary + '15',
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon}
                  size={24}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
