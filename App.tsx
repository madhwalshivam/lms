import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_300Light,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';

import { useAppSelector, useAppDispatch } from './src/hooks';
import { restoreSession } from './src/redux/slices/authSlice';
import { storage } from './src/utils/storage';
import { Platform, ActivityIndicator, View } from 'react-native';
import { NotificationService } from './src/services/notificationService';

// Web font injection for Plus Jakarta Sans
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
    * {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
  `;
  document.head.appendChild(style);
}

// Sub-component to bind expo-status-bar style to the Redux dark mode state
const AppContent = () => {
  const darkMode = useAppSelector(state => state.auth.darkMode);
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const user = useAppSelector(state => state.auth.user);
  const dispatch = useAppDispatch();
  const [loadingSession, setLoadingSession] = React.useState(true);

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const savedUser = await storage.getObject<any>('user_session');
        if (savedUser) {
          dispatch(restoreSession(savedUser));
        }
      } catch (err) {
        console.warn('Session restoration failed:', err);
      } finally {
        setLoadingSession(false);
      }
    };
    checkSession();
  }, [dispatch]);

  // Hook to register push notifications after authentication
  React.useEffect(() => {
    if (isAuthenticated && user && user.id) {
      const setupPushNotifications = async () => {
        try {
          const token = await NotificationService.requestFcmToken();
          if (token) {
            await NotificationService.saveTokenToBackend(user.id!, token);
          }
        } catch (error) {
          console.warn('Push registration failed:', error);
        }
      };
      
      setupPushNotifications();

      // Listeners setup for foreground & background notifications
      const unsubscribe = NotificationService.setupNotificationsListeners();
      return () => unsubscribe();
    }
  }, [isAuthenticated, user]);

  if (loadingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: darkMode ? '#121212' : '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Light': PlusJakartaSans_300Light,
    'PlusJakartaSans-Regular': PlusJakartaSans_400Regular,
    'PlusJakartaSans-Medium': PlusJakartaSans_500Medium,
    'PlusJakartaSans-SemiBold': PlusJakartaSans_600SemiBold,
    'PlusJakartaSans-Bold': PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Don't render anything while loading fonts
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
