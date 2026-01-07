/**
 * TOAST NOTIFICATION
 * Simple toast notifications for user feedback
 */

import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';

export const showToast = {
  success: (message: string, title?: string) => {
    Toast.show({
      type: 'success',
      text1: title || 'Success',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  
  error: (message: string, title?: string) => {
    Toast.show({
      type: 'error',
      text1: title || 'Error',
      text2: message,
      position: 'top',
      visibilityTime: 4000,
    });
  },
  
  info: (message: string, title?: string) => {
    Toast.show({
      type: 'info',
      text1: title || 'Info',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
  
  warning: (message: string, title?: string) => {
    Toast.show({
      type: 'warning',
      text1: title || 'Warning',
      text2: message,
      position: 'top',
      visibilityTime: 3000,
    });
  },
};

export const ToastConfig = () => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  return {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.success,
          backgroundColor: theme.colors.card,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
        }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{
          borderLeftColor: theme.colors.error,
          backgroundColor: theme.colors.card,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
        }}
      />
    ),
    info: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.info,
          backgroundColor: theme.colors.card,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
        }}
      />
    ),
    warning: (props: any) => (
      <BaseToast
        {...props}
        style={{
          borderLeftColor: theme.colors.warning,
          backgroundColor: theme.colors.card,
        }}
        contentContainerStyle={{ paddingHorizontal: 15 }}
        text1Style={{
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.text,
        }}
        text2Style={{
          fontSize: 14,
          color: theme.colors.textSecondary,
        }}
      />
    ),
  };
};
