import { useAppSelector } from './index';
import { theme } from '../theme';

export const useTheme = () => {
  const darkMode = useAppSelector(state => state.auth.darkMode);
  const colors = darkMode ? theme.colors.dark : theme.colors.light;
  
  return {
    colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    darkMode
  };
};
export type AppThemeContext = ReturnType<typeof useTheme>;
