/**
 * BUTTON COMPONENT
 * Reusable button with multiple variants and states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacityProps,
} from 'react-native';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
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
    scale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const isDisabled = disabled || loading;
  
  const styles = createStyles(theme, variant, size, fullWidth, isDisabled);
  
  return (
    <AnimatedTouchable
      style={[styles.container, animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary : theme.colors.textInverse}
            size="small"
          />
        ) : (
          <>
            {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
            <Text style={styles.text}>{title}</Text>
            {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          </>
        )}
      </View>
    </AnimatedTouchable>
  );
};

const createStyles = (
  theme: ReturnType<typeof getTheme>,
  variant: string,
  size: string,
  fullWidth: boolean,
  isDisabled: boolean
) => {
  const sizeStyles = {
    sm: {
      height: 36,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.typography.fontSize.sm,
    },
    md: {
      height: 48,
      paddingHorizontal: theme.spacing.lg,
      fontSize: theme.typography.fontSize.base,
    },
    lg: {
      height: 56,
      paddingHorizontal: theme.spacing.xl,
      fontSize: theme.typography.fontSize.lg,
    },
  };
  
  const variantStyles = {
    primary: {
      backgroundColor: isDisabled ? theme.colors.textTertiary : theme.colors.primary,
      borderWidth: 0,
      borderColor: 'transparent',
      textColor: theme.colors.textInverse,
    },
    secondary: {
      backgroundColor: isDisabled ? theme.colors.backgroundTertiary : theme.colors.secondary,
      borderWidth: 0,
      borderColor: 'transparent',
      textColor: theme.colors.textInverse,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: isDisabled ? theme.colors.border : theme.colors.primary,
      textColor: isDisabled ? theme.colors.textTertiary : theme.colors.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
      borderColor: 'transparent',
      textColor: isDisabled ? theme.colors.textTertiary : theme.colors.primary,
    },
    danger: {
      backgroundColor: isDisabled ? theme.colors.textTertiary : theme.colors.error,
      borderWidth: 0,
      borderColor: 'transparent',
      textColor: theme.colors.textInverse,
    },
  };
  
  const currentSize = sizeStyles[size as keyof typeof sizeStyles];
  const currentVariant = variantStyles[variant as keyof typeof variantStyles];
  
  return StyleSheet.create({
    container: {
      height: currentSize.height,
      paddingHorizontal: currentSize.paddingHorizontal,
      borderRadius: theme.borderRadius.lg,
      backgroundColor: currentVariant.backgroundColor,
      borderWidth: currentVariant.borderWidth,
      borderColor: currentVariant.borderColor,
      justifyContent: 'center',
      alignItems: 'center',
      width: fullWidth ? '100%' : 'auto',
      opacity: isDisabled ? 0.6 : 1,
      ...theme.shadows.sm,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    text: {
      fontSize: currentSize.fontSize,
      fontWeight: theme.typography.fontWeight.semibold,
      color: currentVariant.textColor,
    },
    leftIcon: {
      marginRight: theme.spacing.xs,
    },
    rightIcon: {
      marginLeft: theme.spacing.xs,
    },
  });
};
