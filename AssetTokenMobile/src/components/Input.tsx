/**
 * INPUT COMPONENT
 * Reusable text input with validation and styling
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightElement?: React.ReactNode;
  leftElement?: React.ReactNode;
  containerStyle?: any;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  rightElement,
  leftElement,
  containerStyle,
  style,
  ...props
}) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const [isFocused, setIsFocused] = useState(false);
  
  const styles = createStyles(theme, isFocused, !!error);
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputContainer}>
        {leftElement && <View style={styles.leftElement}>{leftElement}</View>}
        
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const createStyles = (
  theme: ReturnType<typeof getTheme>,
  isFocused: boolean,
  hasError: boolean
) => {
  return StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.input,
      borderWidth: 2,
      borderColor: hasError
        ? theme.colors.error
        : isFocused
        ? theme.colors.inputFocus
        : theme.colors.inputBorder,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      height: 48,
    },
    input: {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text,
      padding: 0,
    },
    leftElement: {
      marginRight: theme.spacing.sm,
    },
    rightElement: {
      marginLeft: theme.spacing.sm,
    },
    error: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    },
  });
};
