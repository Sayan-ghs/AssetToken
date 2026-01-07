/**
 * THEME SYSTEM - Dark mode support with complete color palette
 * Provides consistent styling across the entire application
 */

import { TextStyle, ViewStyle } from 'react-native';

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const Colors = {
  // Light Mode
  light: {
    // Primary colors
    primary: '#3B82F6', // Blue
    primaryLight: '#60A5FA',
    primaryDark: '#2563EB',
    
    // Secondary colors
    secondary: '#8B5CF6', // Purple
    secondaryLight: '#A78BFA',
    secondaryDark: '#7C3AED',
    
    // Accent colors
    accent: '#10B981', // Green
    accentLight: '#34D399',
    accentDark: '#059669',
    
    // Status colors
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Background colors
    background: '#FFFFFF',
    backgroundSecondary: '#F9FAFB',
    backgroundTertiary: '#F3F4F6',
    
    // Card colors
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    
    // Text colors
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    
    // Border colors
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    borderDark: '#D1D5DB',
    
    // Input colors
    input: '#FFFFFF',
    inputBorder: '#D1D5DB',
    inputPlaceholder: '#9CA3AF',
    inputFocus: '#3B82F6',
    
    // Shadow colors
    shadow: '#000000',
    
    // Gradient colors
    gradientStart: '#3B82F6',
    gradientEnd: '#8B5CF6',
    
    // Transaction status
    pending: '#F59E0B',
    confirmed: '#10B981',
    failed: '#EF4444',
  },
  
  // Dark Mode
  dark: {
    // Primary colors
    primary: '#60A5FA', // Lighter blue for dark mode
    primaryLight: '#93C5FD',
    primaryDark: '#3B82F6',
    
    // Secondary colors
    secondary: '#A78BFA', // Lighter purple
    secondaryLight: '#C4B5FD',
    secondaryDark: '#8B5CF6',
    
    // Accent colors
    accent: '#34D399', // Lighter green
    accentLight: '#6EE7B7',
    accentDark: '#10B981',
    
    // Status colors
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#60A5FA',
    
    // Background colors
    background: '#111827',
    backgroundSecondary: '#1F2937',
    backgroundTertiary: '#374151',
    
    // Card colors
    card: '#1F2937',
    cardBorder: '#374151',
    
    // Text colors
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    textInverse: '#111827',
    
    // Border colors
    border: '#374151',
    borderLight: '#4B5563',
    borderDark: '#1F2937',
    
    // Input colors
    input: '#1F2937',
    inputBorder: '#4B5563',
    inputPlaceholder: '#6B7280',
    inputFocus: '#60A5FA',
    
    // Shadow colors
    shadow: '#000000',
    
    // Gradient colors
    gradientStart: '#60A5FA',
    gradientEnd: '#A78BFA',
    
    // Transaction status
    pending: '#FBBF24',
    confirmed: '#34D399',
    failed: '#F87171',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font Weights
  fontWeight: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// ============================================================================
// SHADOWS
// ============================================================================

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
  },
};

// ============================================================================
// LAYOUT
// ============================================================================

export const Layout = {
  screenPadding: Spacing.md,
  cardPadding: Spacing.md,
  sectionSpacing: Spacing.lg,
  headerHeight: 60,
  tabBarHeight: 60,
};

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================

export const AnimationDuration = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// ============================================================================
// THEME TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: typeof Colors.light;
  typography: typeof Typography;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  shadows: typeof Shadows;
  layout: typeof Layout;
  animationDuration: typeof AnimationDuration;
}

// ============================================================================
// GET THEME FUNCTION
// ============================================================================

export const getTheme = (mode: ThemeMode = 'light'): Theme => ({
  mode,
  colors: mode === 'dark' ? Colors.dark : Colors.light,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  layout: Layout,
  animationDuration: AnimationDuration,
});

// ============================================================================
// DEFAULT THEME
// ============================================================================

export const DefaultTheme = getTheme('light');
export const DarkTheme = getTheme('dark');
