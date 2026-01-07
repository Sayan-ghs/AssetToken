/**
 * DASHBOARD SCREEN
 * Main dashboard showing portfolio overview and quick actions
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useThemeStore, useWalletStore } from '../store';
import { getTheme } from '../theme';
import { Card } from '../components';
import { useWallet, useAssets } from '../hooks';
import { formatCurrency, formatAddress, formatNumber } from '../utils';
import { LinearGradient } from 'expo-linear-gradient';

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const { wallet } = useWalletStore();
  const { refreshBalance } = useWallet();
  const { assets, fetchAssets } = useAssets();
  
  const [refreshing, setRefreshing] = React.useState(false);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshBalance(), fetchAssets()]);
    setRefreshing(false);
  };
  
  // Calculate portfolio value
  const portfolioValue = assets.reduce((sum, asset) => {
    return sum + parseFloat(asset.priceUSD || '0');
  }, parseFloat(wallet.balance || '0'));
  
  const styles = createStyles(theme);
  
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Portfolio Card */}
      <Card style={styles.portfolioCard}>
        <LinearGradient
          colors={[theme.colors.gradientStart, theme.colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.portfolioHeader}>
            <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
            <TouchableOpacity>
              <Text style={styles.dots}>⋯</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.portfolioValue}>
            {formatCurrency(portfolioValue)}
          </Text>
          
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>Wallet</Text>
            <Text style={styles.walletAddress}>
              {wallet.address ? formatAddress(wallet.address) : 'Not connected'}
            </Text>
          </View>
        </LinearGradient>
      </Card>
      
      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Swap' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💱</Text>
            </View>
            <Text style={styles.actionText}>Swap</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Liquidity' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>💧</Text>
            </View>
            <Text style={styles.actionText}>Liquidity</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Assets' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📊</Text>
            </View>
            <Text style={styles.actionText}>Assets</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>⚙️</Text>
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Stats</Text>
        
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>ETH Balance</Text>
            <Text style={styles.statValue}>{formatNumber(wallet.balance, 4)} ETH</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Assets Owned</Text>
            <Text style={styles.statValue}>{assets.length}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>Total Invested</Text>
            <Text style={styles.statValue}>{formatCurrency(portfolioValue)}</Text>
          </Card>
          
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>24h Change</Text>
            <Text style={[styles.statValue, styles.positive]}>+0.00%</Text>
          </Card>
        </View>
      </View>
      
      {/* Recent Assets */}
      {assets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Assets</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Assets' as never)}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {assets.slice(0, 3).map((asset) => (
            <Card
              key={asset.id}
              style={styles.assetCard}
              onPress={() => navigation.navigate('AssetDetails' as never)}
            >
              <View style={styles.assetInfo}>
                <View style={styles.assetIconPlaceholder}>
                  <Text style={styles.assetIconText}>{asset.symbol[0]}</Text>
                </View>
                <View style={styles.assetDetails}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                </View>
              </View>
              
              <View style={styles.assetPriceInfo}>
                <Text style={styles.assetPrice}>{formatCurrency(asset.priceUSD)}</Text>
                <Text style={[
                  styles.assetChange,
                  parseFloat(asset.change24h) >= 0 ? styles.positive : styles.negative
                ]}>
                  {parseFloat(asset.change24h) >= 0 ? '+' : ''}
                  {formatNumber(asset.change24h, 2)}%
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
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
    portfolioCard: {
      padding: 0,
      overflow: 'hidden',
      marginBottom: theme.spacing.lg,
    },
    gradient: {
      padding: theme.spacing.lg,
    },
    portfolioHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    portfolioLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textInverse,
      opacity: 0.8,
    },
    dots: {
      fontSize: 24,
      color: theme.colors.textInverse,
    },
    portfolioValue: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
      marginBottom: theme.spacing.lg,
    },
    walletInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    walletLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textInverse,
      opacity: 0.8,
      marginRight: theme.spacing.sm,
    },
    walletAddress: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textInverse,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    seeAll: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    actionCard: {
      alignItems: 'center',
      flex: 1,
      padding: theme.spacing.md,
    },
    actionIcon: {
      width: 56,
      height: 56,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.backgroundSecondary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionIconText: {
      fontSize: 28,
    },
    actionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    statCard: {
      flex: 1,
      minWidth: '45%',
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    statValue: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    positive: {
      color: theme.colors.success,
    },
    negative: {
      color: theme.colors.error,
    },
    assetCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    assetInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    assetIconPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    assetIconText: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    assetDetails: {
      flex: 1,
    },
    assetName: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    assetSymbol: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    assetPriceInfo: {
      alignItems: 'flex-end',
    },
    assetPrice: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    assetChange: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });
};
