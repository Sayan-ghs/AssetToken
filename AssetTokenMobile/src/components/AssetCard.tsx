/**
 * ASSET CARD COMPONENT
 * Display asset information in a card
 */

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from './Card';
import { useThemeStore } from '../store';
import { getTheme } from '../theme';
import { Asset } from '../types';
import { formatCurrency, formatPercent, formatLargeNumber } from '../utils';

interface AssetCardProps {
  asset: Asset;
  onPress?: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onPress }) => {
  const { isDark } = useThemeStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  const styles = createStyles(theme);
  
  const change24h = parseFloat(asset.change24h);
  const isPositive = change24h >= 0;
  
  return (
    <Card onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          {asset.imageUrl ? (
            <Image source={{ uri: asset.imageUrl }} style={styles.icon} />
          ) : (
            <View style={[styles.icon, styles.iconPlaceholder]}>
              <Text style={styles.iconText}>{asset.symbol[0]}</Text>
            </View>
          )}
          
          <View style={styles.details}>
            <Text style={styles.name}>{asset.name}</Text>
            <Text style={styles.symbol}>{asset.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(asset.priceUSD)}</Text>
          <Text style={[styles.change, isPositive ? styles.positive : styles.negative]}>
            {formatPercent(change24h)}
          </Text>
        </View>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>{formatLargeNumber(asset.marketCap)}</Text>
        </View>
        
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Volume 24h</Text>
          <Text style={styles.statValue}>{formatLargeNumber(asset.volume24h)}</Text>
        </View>
      </View>
    </Card>
  );
};

const createStyles = (theme: ReturnType<typeof getTheme>) => {
  return StyleSheet.create({
    card: {
      marginBottom: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    info: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      marginRight: theme.spacing.md,
    },
    iconPlaceholder: {
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textInverse,
    },
    details: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    symbol: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    priceContainer: {
      alignItems: 'flex-end',
    },
    price: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    change: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
    },
    positive: {
      color: theme.colors.success,
    },
    negative: {
      color: theme.colors.error,
    },
    stats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    stat: {
      flex: 1,
    },
    statLabel: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    },
    statValue: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
  });
};
