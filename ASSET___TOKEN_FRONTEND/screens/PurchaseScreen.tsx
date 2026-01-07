import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { mockAssets } from '../data/mockData';

export const PurchaseScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('1');
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [errorReason, setErrorReason] = useState('');
  
  const asset = mockAssets.find((a) => a.id === id);
  
  if (!asset) {
    return (
      <Layout showBack>
        <div className="px-4 py-12 text-center">
          <p className="text-[rgb(var(--color-text-secondary))]">Asset not found</p>
        </div>
      </Layout>
    );
  }
  
  const tokenAmount = parseFloat(amount) || 0;
  const subtotal = tokenAmount * asset.pricePerToken;
  const fee = subtotal * 0.005; // 0.5% fee
  const total = subtotal + fee;
  
  const handlePurchase = () => {
    setStatus('pending');
    
    // Simulate transaction
    setTimeout(() => {
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setStatus('success');
      } else {
        setStatus('failed');
        setErrorReason('Oracle verification failed - price data stale');
      }
    }, 3000);
  };
  
  const handleComplete = () => {
    if (status === 'success') {
      navigate('/portfolio');
    } else {
      navigate(`/asset/${id}`);
    }
  };
  
  if (status === 'pending') {
    return (
      <Layout showBack>
        <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mb-6" />
          <h2 className="text-xl mb-2">Processing Transaction</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-xs">
            Verifying oracle data and executing purchase...
          </p>
        </div>
      </Layout>
    );
  }
  
  if (status === 'success') {
    return (
      <Layout showBack>
        <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-xl mb-2">Purchase Successful</h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-xs mb-8">
            You have successfully purchased {tokenAmount} {asset.tokenSymbol} tokens.
          </p>
          
          <Card className="w-full max-w-sm mb-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Asset</span>
                <span className="font-medium">{asset.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Tokens</span>
                <span className="font-medium">{tokenAmount} {asset.tokenSymbol}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[rgb(var(--color-border))]">
                <span className="text-[rgb(var(--color-text-secondary))]">Total Paid</span>
                <span className="font-medium">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Tx Hash</span>
                <span className="font-mono text-xs text-blue-500">0xabc123...</span>
              </div>
            </div>
          </Card>
          
          <Button variant="primary" size="lg" fullWidth onClick={handleComplete} className="max-w-sm">
            View Portfolio
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (status === 'failed') {
    return (
      <Layout showBack>
        <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl mb-2">Transaction Failed</h2>
          
          <Card className="w-full max-w-sm mb-6 bg-red-500/5 border-red-500/20">
            <div className="space-y-2">
              <p className="text-sm font-medium text-red-400">Error Reason</p>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{errorReason}</p>
            </div>
          </Card>
          
          <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-xs mb-8">
            The transaction could not be completed. Please check the asset status and try again.
          </p>
          
          <Button variant="primary" size="lg" fullWidth onClick={handleComplete} className="max-w-sm">
            Back to Asset Details
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout showBack>
      <div className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Purchase Tokens</h1>
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            Review your purchase details before confirming
          </p>
        </div>
        
        {/* Asset Summary */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-medium mb-1">{asset.name}</h3>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{asset.location}</p>
              </div>
              <Badge variant="success" size="sm">✓ Verified</Badge>
            </div>
            
            <div className="pt-3 border-t border-[rgb(var(--color-border))] text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-[rgb(var(--color-text-secondary))]">Price per Token</span>
                <span className="font-medium">${asset.pricePerToken.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Available Supply</span>
                <span className="font-medium">{asset.availableSupply.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium mb-2">Token Amount</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            max={asset.availableSupply.toString()}
            step="1"
            fullWidth
            placeholder="Enter amount"
          />
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mt-1.5">
            Maximum: {asset.availableSupply} tokens
          </p>
        </div>
        
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">Payment Method</label>
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="text-2xl">💎</div>
              <div className="flex-1">
                <p className="text-sm font-medium">ETH (Ethereum)</p>
                <p className="text-xs text-[rgb(var(--color-text-secondary))]">Pay with your wallet balance</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Price Breakdown */}
        <Card>
          <div className="space-y-3">
            <h3 className="font-medium mb-3">Price Breakdown</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Subtotal</span>
                <span>${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[rgb(var(--color-text-secondary))]">Platform Fee (0.5%)</span>
                <span>${fee.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[rgb(var(--color-border))] text-base font-medium">
                <span>Total</span>
                <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Oracle Verification Check */}
        <Card className="bg-green-500/5 border-green-500/20">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-green-400">Oracle Verification: Active</p>
              <p className="text-[rgb(var(--color-text-secondary))]">
                Price data verified and up-to-date
              </p>
            </div>
          </div>
        </Card>
        
        {/* Confirm Button */}
        <div className="sticky bottom-20 pt-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePurchase}
            disabled={tokenAmount <= 0 || tokenAmount > asset.availableSupply}
          >
            Confirm Transaction
          </Button>
        </div>
      </div>
    </Layout>
  );
};
