import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, Image } from 'react-native';
import { useTheme } from '../hooks';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppSelector } from '../hooks';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface SplashScreenProps {
  navigation: SplashScreenNavigationProp;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { colors, typography } = useTheme();
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Logo entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect timeout
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        navigation.replace('Main', { screen: 'Dashboard' });
      } else {
        navigation.replace('Login');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [navigation, isAuthenticated]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={[styles.tagline, { color: colors.textSecondary, fontSize: typography.fontSizes.sm }]}>
          Smart Lead Management Platform
        </Text>
      </Animated.View>

      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        <Text style={[styles.version, { color: colors.textSecondary, fontSize: typography.fontSizes.xs }]}>
          Version 1.0.0 (Production Ready)
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 120,
  },
  logoImage: {
    width: 260,
    height: 130,
    marginBottom: 20,
  },
  tagline: {
    marginTop: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  loaderContainer: {
    alignItems: 'center',
  },
  loader: {
    marginBottom: 16,
  },
  version: {
    fontWeight: '400',
  },
});
export default SplashScreen;
