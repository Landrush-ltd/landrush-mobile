import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  color: string;
  onPress: () => void;
}

export function CategoryChip({ label, isActive, color, onPress }: CategoryChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: Colors.chipActive, borderColor: Colors.primary }
          : { backgroundColor: Colors.white, borderColor: Colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.chipText,
          isActive
            ? { color: Colors.primary, fontWeight: '600' }
            : { color: Colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: 1,
  },
  chipText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
});
