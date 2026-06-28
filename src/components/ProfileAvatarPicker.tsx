import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  ZoomIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../context/ThemeContext';
import { BorderRadius, Spacing, Shadow } from '../constants/theme';
import { triggerHaptic } from '../utils/haptics';

interface AvatarOption {
  id: string;
  uri?: string;
  initials?: string;
  color: string;
}

interface ProfileAvatarPickerProps {
  current: AvatarOption;
  options: AvatarOption[];
  onSelect: (option: AvatarOption) => void;
  size?: number;
}

/**
 * Animated avatar picker
 * Smooth selection with scale feedback
 * Perfect for: profile customization, avatar selection
 */
export function ProfileAvatarPicker({
  current,
  options,
  onSelect,
  size = 120,
}: ProfileAvatarPickerProps) {
  const colors = useColors();
  const [expanded, setExpanded] = useState(false);

  const handleSelect = async (option: AvatarOption) => {
    await triggerHaptic('light');
    onSelect(option);
    setExpanded(false);
  };

  return (
    <View style={styles.container}>
      {/* Current avatar */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.currentWrap}
        activeOpacity={0.8}
      >
        <Animated.View
          entering={ZoomIn.springify()}
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          {current.uri ? (
            <Image
              source={{ uri: current.uri }}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: current.color,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
            >
              <Ionicons
                name="person"
                size={size / 2}
                color="#FFFFFF"
              />
            </View>
          )}

          {/* Edit overlay */}
          <View style={[styles.editOverlay, { backgroundColor: colors.black + '40' }]}>
            <Ionicons name="camera" size={24} color="#FFFFFF" />
          </View>
        </Animated.View>
      </TouchableOpacity>

      {/* Options grid */}
      {expanded && (
        <Animated.View entering={ZoomIn.springify()} style={styles.optionsWrap}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSelect(option)}
              style={styles.optionBtn}
              activeOpacity={0.8}
            >
              <Animated.View
                entering={ZoomIn.delay(index * 50).springify()}
                style={[
                  styles.optionAvatar,
                  {
                    borderColor:
                      option.id === current.id ? colors.primary : 'transparent',
                    borderWidth: option.id === current.id ? 3 : 0,
                  },
                ]}
              >
                {option.uri ? (
                  <Image
                    source={{ uri: option.uri }}
                    style={StyleSheet.absoluteFill}
                  />
                ) : (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: option.color,
                        justifyContent: 'center',
                        alignItems: 'center',
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={32}
                      color="#FFFFFF"
                    />
                  </View>
                )}

                {/* Checkmark */}
                {option.id === current.id && (
                  <View style={[styles.checkmark, { backgroundColor: colors.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  currentWrap: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#f0f0f0',
    ...Shadow.lg,
  },
  editOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  optionBtn: {
    width: '30%',
    aspectRatio: 1,
  },
  optionAvatar: {
    flex: 1,
    borderRadius: 50,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  checkmark: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});
