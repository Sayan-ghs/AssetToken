/**
 * WALLET CONNECT SCREEN
 * Screen for connecting wallet using WalletConnect v2
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import { useWalletStore } from '../store';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';
import { Button, Card } from '../components';
import { showToast } from '../components/Toast';
import { walletService, walletConnectConfig } from '../services/wallet';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants';

export const WalletConnectScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const { setWallet } = useWalletStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { open, isConnected, address, provider } = useWalletConnectModal();
  
  // Handle connection success
  React.useEffect(() => {
    if (isConnected && address && provider) {
      handleConnectionSuccess(address, provider);
    }
  }, [isConnected, address, provider]);
  
  const handleConnectionSuccess = async (walletAddress: string, wcProvider: any) => {
    try {
      setIsConnecting(true);
      
      // Initialize wallet service
      const walletData = await walletService.initializeFromSession(wcProvider);
      
      // Update store
      setWallet({
        address: walletData.address,
        isConnected: true,
        balance: '0', // Will be fetched by useWallet hook
        chainId: walletData.chainId,
        provider: walletData.provider,
        signer: walletData.signer,
      });
      
      showToast.success(SUCCESS_MESSAGES.WALLET_CONNECTED);
      
      // Navigate to main app
      setTimeout(() => {
        navigation.navigate('Main' as never);
      }, 500);
    } catch (error: any) {
      console.error('Connection error:', error);
      showToast.error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      await open();
    } catch (error: any) {
      console.error('Failed to open WalletConnect:', error);
      showToast.error(ERROR_MESSAGES.UNKNOWN_ERROR);
      setIsConnecting(false);
    }
  };
  
  const styles = createStyles(theme);
  
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AT</Text>
          </View>
          <Text style={styles.title}>Welcome to AssetToken</Text>
          <Text style={styles.subtitle}>
            Connect your wallet to start tokenizing real-world assets
          </Text>
        </View>
        
        <View style={styles.features}>
          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>Secure & Private</Text>
            <Text style={styles.featureDescription}>
              Your keys, your assets. We never have access to your wallet.
            </Text>
          </Card>
          
          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>💎</Text>
            <Text style={styles.featureTitle}>Real Assets</Text>
            <Text style={styles.featureDescription}>
              Tokenize and trade real-world assets on the blockchain.
            </Text>
          </Card>
          
          <Card style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Fast & Easy</Text>
            <Text style={styles.featureDescription}>
              Connect wallet in seconds and start trading immediately.
            </Text>
          </Card>
        </View>
        
        <View style={styles.actions}>
          <Button
            title={isConnecting ? 'Connecting...' : 'Connect Wallet'}
            onPress={handleConnect}
            loading={isConnecting}
            fullWidth
            size="lg"
          />
          
          <Text style={styles.disclaimer}>
            By connecting, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
      
      <WalletConnectModal
        projectId={walletConnectConfig.projectId}
        providerMetadata={walletConnectConfig.providerMetadata}
      />
    </>
  );
};

const createStyles = (theme: ReturnType<typeof getTheme>) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      padding: theme.spacing.lg,
    },
    header: {
      alignItems: 'center',
      marginTop: theme.spacing['3xl'],
      marginBottom: theme.spacing.xl,
    },
    logo: {
      width: 100,
      height: 100,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      ...theme.shadows.lg,
    },
    logoText: {
      fontSize: 42,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    title: {
      fontSize: theme.typography.fontSize['2xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    features: {
      marginBottom: theme.spacing.xl,
    },
    featureCard: {
      marginBottom: theme.spacing.md,
      alignItems: 'center',
    },
    featureIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.md,
    },
    featureTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    featureDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    actions: {
      marginBottom: theme.spacing.xl,
    },
    disclaimer: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: theme.spacing.md,
    },
  });
};
