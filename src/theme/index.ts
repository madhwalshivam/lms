export const theme = {
  colors: {
    light: {
      primary: '#00B550', // Logo Green
      primaryLight: '#E8F8EE', // Tinted Light Green
      secondary: '#F3A000', // Logo Gold/Orange
      background: '#FFFFFF',
      surface: '#F9FAFB',
      card: '#FFFFFF',
      text: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      accent: '#F3F4F6',
      success: '#10B981', // green
      successLight: '#D1FAE5',
      warning: '#F3A000', // logo gold
      warningLight: '#FEF3C7',
      danger: '#EF4444', // red
      dangerLight: '#FEE2E2',
      info: '#3B82F6', // blue
      infoLight: '#DBEAFE',
      shadowColor: '#9CA3AF',
      placeholder: '#9CA3AF',
    },
    dark: {
      primary: '#05C065', // Lighter Green for contrast
      primaryLight: '#042F1A',
      secondary: '#FBBF24',
      background: '#0F172A', // Slate 900
      surface: '#1E293B', // Slate 800
      card: '#1E293B',
      text: '#F9FAFB',
      textSecondary: '#9CA3AF',
      border: '#334155',
      accent: '#1E293B',
      success: '#34D399',
      successLight: '#064E3B',
      warning: '#FBBF24',
      warningLight: '#78350F',
      danger: '#F87171',
      dangerLight: '#7F1D1D',
      info: '#60A5FA',
      infoLight: '#1E3A8A',
      shadowColor: '#000000',
      placeholder: '#4B5563',
    }
  },
  typography: {
    fontSizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },
    fontWeights: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    fontFamilies: {
      light: 'PlusJakartaSans-Light',
      regular: 'PlusJakartaSans-Regular',
      medium: 'PlusJakartaSans-Medium',
      semibold: 'PlusJakartaSans-SemiBold',
      bold: 'PlusJakartaSans-Bold',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  }
};

export type AppTheme = typeof theme;
