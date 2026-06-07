import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '../hooks';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}


export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const { colors, borderRadius } = useTheme();

  const cardStyle = [
    styles.card,
    {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: borderRadius.md,
      shadowColor: colors.shadowColor,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && styles.pressed]}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    opacity: 0.85,
  },
});
