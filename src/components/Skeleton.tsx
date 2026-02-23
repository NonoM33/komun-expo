import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { colors, borderRadius } from '../utils/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

interface SkeletonPostProps {
  count?: number;
}

export function SkeletonPost({ count = 1 }: SkeletonPostProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.postContainer}>
          <View style={styles.header}>
            <Skeleton width={40} height={40} borderRadius={20} />
            <View style={styles.headerText}>
              <Skeleton width={120} height={16} />
              <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
            </View>
          </View>
          <Skeleton width="100%" height={16} style={{ marginTop: 12 }} />
          <Skeleton width="80%" height={16} style={{ marginTop: 8 }} />
          <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
          <View style={styles.footer}>
            <Skeleton width={60} height={24} />
            <Skeleton width={60} height={24} />
          </View>
        </View>
      ))}
    </>
  );
}

interface SkeletonChannelProps {
  count?: number;
}

export function SkeletonChannel({ count = 1 }: SkeletonChannelProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.channelContainer}>
          <Skeleton width={48} height={48} borderRadius={24} />
          <View style={styles.channelText}>
            <Skeleton width={150} height={16} />
            <Skeleton width={200} height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </>
  );
}

interface SkeletonResidentProps {
  count?: number;
}

export function SkeletonResident({ count = 1 }: SkeletonResidentProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.residentContainer}>
          <Skeleton width={56} height={56} borderRadius={28} />
          <View style={styles.residentText}>
            <Skeleton width={140} height={16} />
            <Skeleton width={100} height={14} style={{ marginTop: 6 }} />
          </View>
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.surfaceLight,
  },
  postContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    marginBottom: 12,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 12,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 16,
  },
  channelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  channelText: {
    marginLeft: 12,
    flex: 1,
  },
  residentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: borderRadius.md,
  },
  residentText: {
    marginLeft: 12,
    flex: 1,
  },
});
