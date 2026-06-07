import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks';

interface BadgeProps {
  label: string;
  type: 'status' | 'source' | 'generic';
  value: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, type, value }) => {
  const { colors, typography } = useTheme();

  let bgColor = colors.accent;
  let textColor = colors.textSecondary;

  if (type === 'status') {
    switch (value) {
      case 'New':
        bgColor = colors.infoLight;
        textColor = colors.info;
        break;
      case 'Contacted':
        bgColor = colors.warningLight;
        textColor = colors.warning;
        break;
      case 'Follow-Up':
        bgColor = colors.primaryLight;
        textColor = colors.primary;
        break;
      case 'Converted':
        bgColor = colors.successLight;
        textColor = colors.success;
        break;
      case 'Rejected':
        bgColor = colors.dangerLight;
        textColor = colors.danger;
        break;
    }
  } else if (type === 'source') {
    switch (value) {
      case 'Website':
        bgColor = colors.primaryLight;
        textColor = colors.primary;
        break;
      case 'Facebook Ads':
        bgColor = '#E8F0FE';
        textColor = '#1A73E8';
        break;
      case 'Instagram Ads':
        bgColor = '#FCE8E6';
        textColor = '#D93025';
        break;
      case 'Google Ads':
        bgColor = '#E6F4EA';
        textColor = '#137333';
        break;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor, fontSize: typography.fontSizes.xs - 2, fontFamily: typography.fontFamilies.bold }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
