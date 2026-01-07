/**
 * LOADING COMPONENT
 * Various loading indicators for the app
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface LoadingProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'large',
  fullScreen = false,
}) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const styles = createStyles(theme, fullScreen);
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={theme.colors.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

// Skeleton Loader for cards
export const SkeletonLoader: React.FC<{ width?: number | string; height?: number }> = ({
  width = '100%',
  height = 20,
}) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const opacity = useSharedValue(0.3);
  
  React.useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  const staticStyle: any = {
    width: typeof width === 'string' && !width.endsWith('%') ? '100%' : width,
    height,
    backgroundColor: theme.colors.backgroundTertiary,
    borderRadius: theme.borderRadius.sm,
  };
  
  return (
    <Animated.View
      style={[
        staticStyle,
        animatedStyle,
      ]}
    />
  );
};

// Spinner for inline loading
export const Spinner: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color,
}) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  return (
    <ActivityIndicator
      size={size as any}
      color={color || theme.colors.primary}
    />
  );
};

const createStyles = (theme: ReturnType<typeof getTheme>, fullScreen: boolean) => {
  return StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
      ...(fullScreen && {
        flex: 1,
        backgroundColor: theme.colors.background,
      }),
    },
    message: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });
};
