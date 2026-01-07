/**
 * MAIN APP COMPONENT
 * Root component that wraps the entire application
 */

import React, { useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Navigation } from './navigation';
import { ToastConfig } from './components/Toast';
import { useThemeStore } from './store';
import { getTheme } from './theme';
import * as SplashScreen from 'expo-splash-screen';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const [appIsReady, setAppIsReady] = React.useState(false);
  
  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load any necessary data here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    
    prepare();
  }, []);
  
  if (!appIsReady) {
    return null;
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        
        <Navigation />
        
        <Toast config={ToastConfig()} />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
