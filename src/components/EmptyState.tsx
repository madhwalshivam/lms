import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'clipboard-text-outline',
  title,
  description,
}) => {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={colors.textSecondary} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text, fontSize: typography.fontSizes.lg }]}>
        {title}
      </Text>
      <Text style={[styles.description, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  icon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 260,
  },
});
