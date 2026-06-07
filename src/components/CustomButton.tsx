import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'danger' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  style?: ViewStyle;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  type = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
}) => {
  const { colors, typography, borderRadius } = useTheme();

  let btnBgColor = colors.primary;
  let btnTextColor = '#FFFFFF';
  let btnBorderColor = 'transparent';

  if (type === 'secondary') {
    btnBgColor = colors.surface;
    btnTextColor = colors.text;
    btnBorderColor = colors.border;
  } else if (type === 'danger') {
    btnBgColor = colors.danger;
    btnTextColor = '#FFFFFF';
  } else if (type === 'outline') {
    btnBgColor = 'transparent';
    btnTextColor = colors.primary;
    btnBorderColor = colors.primary;
  }

  if (disabled || loading) {
    btnBgColor = type === 'outline' ? 'transparent' : colors.border;
    btnTextColor = colors.textSecondary;
    btnBorderColor = type === 'outline' ? colors.border : 'transparent';
  }

  return (
    <Pressable
      onPress={disabled || loading ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: btnBgColor,
          borderColor: btnBorderColor,
          borderWidth: btnBorderColor !== 'transparent' ? 1 : 0,
          borderRadius: borderRadius.md,
        },
        style,
        pressed && !disabled && !loading && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={btnTextColor} size="small" />
      ) : (
        <>
          {icon && (
            <MaterialCommunityIcons
              name={icon}
              size={18}
              color={btnTextColor}
              style={styles.icon}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: btnTextColor,
                fontSize: typography.fontSizes.sm,
                fontFamily: typography.fontFamilies.semibold,
              },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 8,
  },
});
