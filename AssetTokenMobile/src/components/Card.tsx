/**
 * CARD COMPONENT
 * Reusable card container with shadow and styling
 */

import React from 'react';
import { View, StyleSheet, ViewProps, Pressable } from 'react-native';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding,
  style,
  ...props
}) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98);
    }
  };
  
  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1);
    }
  };
  
  const styles = createStyles(theme, variant, padding);
  
  if (onPress) {
    return (
      <AnimatedPressable
        style={[styles.container, animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        {children}
      </AnimatedPressable>
    );
  }
  
  return (
    <View style={[styles.container, style]} {...props}>
      {children}
    </View>
  );
};

const createStyles = (
  theme: ReturnType<typeof getTheme>,
  variant: string,
  padding?: number
) => {
  const variantStyles = {
    default: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.sm,
    },
    elevated: {
      backgroundColor: theme.colors.card,
      ...theme.shadows.md,
    },
    outlined: {
      backgroundColor: theme.colors.card,
      borderWidth: 1,
      borderColor: theme.colors.cardBorder,
    },
  };
  
  const currentVariant = variantStyles[variant as keyof typeof variantStyles];
  
  return StyleSheet.create({
    container: {
      borderRadius: theme.borderRadius.lg,
      padding: padding ?? theme.layout.cardPadding,
      ...currentVariant,
    },
  });
};
