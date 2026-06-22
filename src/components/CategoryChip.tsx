import React, { useMemo } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Spacing, FontSize, BorderRadius } from '../constants/theme';
import type { ThemeColors } from '../constants/theme';
import { useColors } from '../context/ThemeContext';

interface CategoryChipProps {
  label: string;
  isActive: boolean;
  color: string;
  onPress: () => void;
}

export function CategoryChip({ label, isActive, color, onPress }: CategoryChipProps) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isActive
          ? { backgroundColor: colors.textPrimary, borderColor: colors.textPrimary }
          : { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.chipText,
          isActive
            ? { color: colors.textInverse, fontWeight: '700' }
            : { color: colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
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
}
