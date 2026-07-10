import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CategoryIconProps {
  size?: number;
  iconColor?: string;
  badgeColor?: string;
}

export function BuyCategoryIcon({ size = 48, iconColor = '#FFFFFF', badgeColor = '#2D6A4F' }: CategoryIconProps) {
  const badgeSize = Math.round(size * 0.45);
  return (
    <View style={[{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="home-sharp" size={size} color={iconColor} />
      <View style={[
        {
          position: 'absolute',
          bottom: -6,
          right: -6,
          backgroundColor: badgeColor,
          borderRadius: badgeSize / 2 + 2,
          padding: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <Ionicons name="cart-sharp" size={badgeSize} color="#FFFFFF" />
      </View>
    </View>
  );
}

export function LeaseCategoryIcon({ size = 48, iconColor = '#FFFFFF', badgeColor = '#2D6A4F' }: CategoryIconProps) {
  const badgeSize = Math.round(size * 0.4);
  return (
    <View style={[{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="document-text-sharp" size={size} color={iconColor} />
      <View style={[
        {
          position: 'absolute',
          bottom: -4,
          right: -4,
          backgroundColor: badgeColor,
          borderRadius: badgeSize / 2 + 2,
          padding: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <Ionicons name="pencil-sharp" size={badgeSize} color="#FFFFFF" />
      </View>
    </View>
  );
}

export function DistressCategoryIcon({ size = 48, iconColor = '#FFFFFF', badgeColor = '#2D6A4F' }: CategoryIconProps) {
  const badgeSize = Math.round(size * 0.4);
  return (
    <View style={[{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }]}>
      <Ionicons name="home-sharp" size={size} color={iconColor} />
      <View style={[
        {
          position: 'absolute',
          top: -6,
          right: -6,
          backgroundColor: badgeColor,
          borderRadius: badgeSize / 2 + 2,
          padding: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }
      ]}>
        <Ionicons name="warning-sharp" size={badgeSize} color="#FFFFFF" />
      </View>
    </View>
  );
}
