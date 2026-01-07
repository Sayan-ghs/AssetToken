/**
 * NAVIGATION
 * React Navigation setup with stack and bottom tabs
 */

import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';

// Screens
import { SplashScreen } from '../screens/SplashScreen';
import { WalletConnectScreen } from '../screens/WalletConnectScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SwapScreen } from '../screens/SwapScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator
const MainTabs: React.FC = () => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: theme.layout.tabBarHeight,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: theme.typography.fontSize.xs,
          fontWeight: theme.typography.fontWeight.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      
      <Tab.Screen
        name="Assets"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Assets',
          tabBarIcon: ({ color, size }) => <TabIcon icon="💎" color={color} />,
        }}
      />
      
      <Tab.Screen
        name="Swap"
        component={SwapScreen}
        options={{
          tabBarLabel: 'Swap',
          tabBarIcon: ({ color, size }) => <TabIcon icon="💱" color={color} />,
        }}
      />
      
      <Tab.Screen
        name="Liquidity"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Liquidity',
          tabBarIcon: ({ color, size }) => <TabIcon icon="💧" color={color} />,
        }}
      />
      
      <Tab.Screen
        name="Profile"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Tab Icon Component
const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon, color }) => {
  return <Text style={{ fontSize: 24, opacity: color === '#3B82F6' ? 1 : 0.5 }}>{icon}</Text>;
};

// Placeholder Screen (for tabs not yet implemented)
const PlaceholderScreen: React.FC = () => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    }}>
      <Text style={{
        fontSize: theme.typography.fontSize['2xl'],
        color: theme.colors.textSecondary,
      }}>
        Coming Soon
      </Text>
    </View>
  );
};

// Root Navigator
export const Navigation: React.FC = () => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.card,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.error,
        },
        fonts: {
          regular: {
            fontFamily: theme.typography.fontFamily.regular,
            fontWeight: '400',
          },
          medium: {
            fontFamily: theme.typography.fontFamily.medium,
            fontWeight: '500',
          },
          bold: {
            fontFamily: theme.typography.fontFamily.bold,
            fontWeight: '700',
          },
          heavy: {
            fontFamily: theme.typography.fontFamily.bold,
            fontWeight: '900',
          },
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="WalletConnect" component={WalletConnectScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
