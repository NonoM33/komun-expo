import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { colors, borderRadius } from '../utils/theme';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle | ImageStyle;
}

const sizes = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const fontSizes = {
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
};

export function Avatar({ uri, name, size = 'md', style }: AvatarProps) {
  const dimension = sizes[size];
  const fontSize = fontSizes[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          style as ImageStyle,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.surfaceLight,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.text,
    fontWeight: '600',
  },
});
