import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme, useAppSelector } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LeadsScreen from '../screens/LeadsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LeadDetailsScreen from '../screens/LeadDetailsScreen';
import AddLeadScreen from '../screens/AddLeadScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TabNavigator = () => {
  const { colors } = useTheme();
  const unreadCount = useAppSelector(state => state.notifications.unreadCount);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          elevation: 8,
          shadowOpacity: 0.1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'help-circle-outline';

          if (route.name === 'Dashboard') {
            iconName = 'view-dashboard-outline';
          } else if (route.name === 'Leads') {
            iconName = 'account-group-outline';
          } else if (route.name === 'Analytics') {
            iconName = 'chart-line';
          } else if (route.name === 'Notifications') {
            iconName = 'bell-outline';
          } else if (route.name === 'Profile') {
            iconName = 'account-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={unreadCount > 0 ? { tabBarBadge: unreadCount, tabBarBadgeStyle: { backgroundColor: colors.primary } } : undefined}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="LeadDetails" component={LeadDetailsScreen} />
      <Stack.Screen name="AddLead" component={AddLeadScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
