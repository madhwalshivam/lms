import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../hooks';

interface LoadingSkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity: pulseAnim,
        },
        style,
      ]}
    />
  );
};

export const LeadsSkeleton: React.FC = () => {
  return (
    <View style={styles.listContainer}>
      {[1, 2, 3].map(i => (
        <View key={i} style={styles.cardSkeleton}>
          <View style={styles.headerRow}>
            <LoadingSkeleton width={120} height={20} />
            <LoadingSkeleton width={80} height={22} borderRadius={6} />
          </View>
          <View style={styles.divider} />
          <View style={styles.metaRow}>
            <LoadingSkeleton width="45%" height={14} style={styles.metaItem} />
            <LoadingSkeleton width="45%" height={14} style={styles.metaItem} />
            <LoadingSkeleton width="60%" height={14} style={styles.metaItem} />
            <LoadingSkeleton width="30%" height={14} style={styles.metaItem} />
          </View>
          <View style={styles.actionsRow}>
            <LoadingSkeleton width={60} height={30} borderRadius={6} />
            <LoadingSkeleton width={60} height={30} borderRadius={6} />
            <LoadingSkeleton width={60} height={30} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  listContainer: {
    padding: 16,
  },
  cardSkeleton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
});
