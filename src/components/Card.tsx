import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({ children, style, onPress, padding = 'md' }: CardProps) {
  const paddingStyle = {
    none: 0,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  };

  const content = (
    <View style={[styles.card, { padding: paddingStyle[padding] }, style]}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
