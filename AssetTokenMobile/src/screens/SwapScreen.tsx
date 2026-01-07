/**
 * SWAP SCREEN
 * Token swap functionality with AMM integration
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStore, useWalletStore } from '../store';
import { getTheme } from '../theme';
import { Button, Card, Input, Modal } from '../components';
import { showToast } from '../components/Toast';
import { useAMM, useContract, useDebounce } from '../hooks';
import { formatNumber, formatCurrency, calculateMinimumReceived } from '../utils';
import { CONTRACT_ADDRESSES } from '../constants';

export const SwapScreen: React.FC = () => {
  const { isDark } = useThemeStore();
  const { wallet } = useWalletStore();
  const theme = getTheme(isDark ? 'dark' : 'light');
  
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [isReversed, setIsReversed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  
  const debouncedFromAmount = useDebounce(fromAmount, 500);
  
  const { poolReserves, swapTokenForETH, swapETHForToken } = useAMM(CONTRACT_ADDRESSES.AMM_POOL);
  const { approveToken } = useContract();
  
  // Calculate output amount when input changes
  useEffect(() => {
    if (debouncedFromAmount && poolReserves) {
      const inputAmount = parseFloat(debouncedFromAmount);
      if (inputAmount > 0) {
        calculateOutput(inputAmount);
      } else {
        setToAmount('');
      }
    }
  }, [debouncedFromAmount, poolReserves, isReversed]);
  
  const calculateOutput = (input: number) => {
    if (!poolReserves) return;
    
    try {
      const inputStr = input.toString();
      let output: number;
      
      if (isReversed) {
        // Token to ETH
        const reserveIn = parseFloat(poolReserves.reserveToken);
        const reserveOut = parseFloat(poolReserves.reserveETH);
        const amountInWithFee = input * 0.997; // 0.3% fee
        output = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
      } else {
        // ETH to Token
        const reserveIn = parseFloat(poolReserves.reserveETH);
        const reserveOut = parseFloat(poolReserves.reserveToken);
        const amountInWithFee = input * 0.997;
        output = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);
      }
      
      setToAmount(output.toFixed(6));
    } catch (error) {
      console.error('Output calculation failed:', error);
      setToAmount('0');
    }
  };
  
  const handleSwap = async () => {
    if (!fromAmount || !toAmount) {
      showToast.error('Please enter an amount');
      return;
    }
    
    const inputAmount = parseFloat(fromAmount);
    if (inputAmount <= 0) {
      showToast.error('Invalid amount');
      return;
    }
    
    setIsSwapping(true);
    
    try {
      let result;
      
      if (isReversed) {
        // Token to ETH - need approval first
        const approvalResult = await approveToken(
          CONTRACT_ADDRESSES.ASSET_TOKEN,
          CONTRACT_ADDRESSES.AMM_POOL,
          fromAmount
        );
        
        if (!approvalResult.success) {
          showToast.error('Token approval failed');
          return;
        }
        
        result = await swapTokenForETH(fromAmount, slippage);
      } else {
        // ETH to Token
        result = await swapETHForToken(fromAmount, slippage);
      }
      
      if (result.success) {
        showToast.success('Swap successful!');
        setFromAmount('');
        setToAmount('');
      } else {
        showToast.error(result.error || 'Swap failed');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Swap failed');
    } finally {
      setIsSwapping(false);
    }
  };
  
  const handleReverse = () => {
    setIsReversed(!isReversed);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  const fromToken = isReversed ? 'TOKEN' : 'ETH';
  const toToken = isReversed ? 'ETH' : 'TOKEN';
  const minimumReceived = calculateMinimumReceived(toAmount, slippage);
  
  const styles = createStyles(theme);
  
  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Swap Tokens</Text>
            <TouchableOpacity onPress={() => setShowSettings(true)}>
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* From Input */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>From</Text>
              <Text style={styles.balance}>
                Balance: {fromToken === 'ETH' ? formatNumber(wallet.balance, 4) : '0.00'}
              </Text>
            </View>
            
            <View style={styles.inputRow}>
              <Input
                value={fromAmount}
                onChangeText={setFromAmount}
                placeholder="0.0"
                keyboardType="decimal-pad"
                containerStyle={styles.input}
                style={styles.inputText}
              />
              
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenText}>{fromToken}</Text>
              </View>
            </View>
          </View>
          
          {/* Swap Direction Button */}
          <TouchableOpacity style={styles.swapButton} onPress={handleReverse}>
            <Text style={styles.swapIcon}>⇅</Text>
          </TouchableOpacity>
          
          {/* To Input */}
          <View style={styles.inputSection}>
            <View style={styles.inputHeader}>
              <Text style={styles.inputLabel}>To</Text>
            </View>
            
            <View style={styles.inputRow}>
              <Input
                value={toAmount}
                placeholder="0.0"
                editable={false}
                containerStyle={styles.input}
                style={styles.inputText}
              />
              
              <View style={styles.tokenBadge}>
                <Text style={styles.tokenText}>{toToken}</Text>
              </View>
            </View>
          </View>
          
          {/* Swap Details */}
          {toAmount && poolReserves && (
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rate</Text>
                <Text style={styles.detailValue}>
                  1 {fromToken} = {formatNumber(parseFloat(toAmount) / parseFloat(fromAmount), 6)} {toToken}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Minimum Received</Text>
                <Text style={styles.detailValue}>
                  {formatNumber(minimumReceived, 6)} {toToken}
                </Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Slippage Tolerance</Text>
                <Text style={styles.detailValue}>{slippage}%</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>0.3%</Text>
              </View>
            </View>
          )}
        </Card>
        
        <Button
          title={isSwapping ? 'Swapping...' : 'Swap'}
          onPress={handleSwap}
          loading={isSwapping}
          disabled={!fromAmount || !toAmount || isSwapping}
          fullWidth
          size="lg"
        />
      </ScrollView>
      
      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        title="Swap Settings"
        height={300}
      >
        <View style={styles.settingsContent}>
          <Text style={styles.settingLabel}>Slippage Tolerance</Text>
          
          <View style={styles.slippageOptions}>
            {[0.1, 0.5, 1.0].map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.slippageOption,
                  slippage === value && styles.slippageOptionActive,
                ]}
                onPress={() => setSlippage(value)}
              >
                <Text
                  style={[
                    styles.slippageText,
                    slippage === value && styles.slippageTextActive,
                  ]}
                >
                  {value}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Input
            label="Custom Slippage (%)"
            value={slippage.toString()}
            onChangeText={(text) => setSlippage(parseFloat(text) || 0.5)}
            keyboardType="decimal-pad"
            containerStyle={styles.customSlippage}
          />
        </View>
      </Modal>
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
    card: {
      marginBottom: theme.spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    settingsIcon: {
      fontSize: 24,
    },
    inputSection: {
      marginBottom: theme.spacing.md,
    },
    inputHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    inputLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    balance: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.primary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    input: {
      flex: 1,
    },
    inputText: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.semibold,
    },
    tokenBadge: {
      backgroundColor: theme.colors.backgroundSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.borderRadius.lg,
      minWidth: 80,
      alignItems: 'center',
    },
    tokenText: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    swapButton: {
      alignSelf: 'center',
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: theme.spacing.md,
      ...theme.shadows.md,
    },
    swapIcon: {
      fontSize: 24,
      color: theme.colors.textInverse,
    },
    details: {
      marginTop: theme.spacing.lg,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.backgroundSecondary,
      borderRadius: theme.borderRadius.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
    },
    settingsContent: {
      paddingVertical: theme.spacing.md,
    },
    settingLabel: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    slippageOptions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    slippageOption: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.backgroundSecondary,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    slippageOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primaryLight + '20',
    },
    slippageText: {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text,
      fontWeight: theme.typography.fontWeight.medium,
    },
    slippageTextActive: {
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold,
    },
    customSlippage: {
      marginTop: theme.spacing.md,
    },
  });
};
