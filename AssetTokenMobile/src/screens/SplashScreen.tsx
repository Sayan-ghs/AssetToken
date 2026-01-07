/**
 * SPLASH SCREEN
 * Initial loading screen with branding
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useThemeStore, useWalletStore } from '../store';
import { getTheme } from '../theme';
import { Loading } from '../components';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const { wallet } = useWalletStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    // Animate logo
    scale.value = withSpring(1, { damping: 10 });
    opacity.value = withSequence(
      withDelay(300, withSpring(1)),
    );
    
    // Navigate after delay
    const timer = setTimeout(() => {
      if (wallet.isConnected) {
        navigation.navigate('Main' as never);
      } else {
        navigation.navigate('WalletConnect' as never);
      }
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));
  
  const styles = createStyles(theme);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, animatedStyle]}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>AT</Text>
        </View>
        <Text style={styles.title}>AssetToken</Text>
        <Text style={styles.subtitle}>Tokenize Real-World Assets</Text>
      </Animated.View>
      
      <Loading message="Loading..." />
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof getTheme>) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logo: {
      width: 120,
      height: 120,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.lg,
    },
    logoText: {
      fontSize: 48,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
};
