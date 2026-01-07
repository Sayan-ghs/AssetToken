import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { DollarSign, Download, TrendingUp, Calendar } from 'lucide-react';
import { mockIncome } from '../data/mockData';

export const IncomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [claiming, setClaiming] = useState<string | null>(null);
  
  const totalClaimable = mockIncome.reduce((sum, item) => sum + item.claimable, 0);
  const totalClaimed = mockIncome.reduce((sum, item) => sum + item.claimed, 0);
  const lifetimeEarnings = totalClaimable + totalClaimed;
  
  const handleClaim = (assetId: string) => {
    setClaiming(assetId);
    setTimeout(() => {
      setClaiming(null);
      // In real app, would update the income data
    }, 2000);
  };
  
  const distributionHistory = [
    {
      id: '1',
      date: '2026-01-01',
      assetName: 'Brooklyn Heights Residential',
      amount: 131.25,
      txHash: '0xabc123...',
    },
    {
      id: '2',
      date: '2025-12-01',
      assetName: 'Brooklyn Heights Residential',
      amount: 131.25,
      txHash: '0xdef456...',
    },
    {
      id: '3',
      date: '2025-12-01',
      assetName: 'Miami Art District Commercial',
      amount: 119.70,
      txHash: '0xghi789...',
    },
  ];
  
  return (
    <Layout title="Income">
      <div className="px-4 py-6 space-y-6">
        {/* Income Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Claimable</p>
              <p className="text-lg font-semibold text-green-400">
                ${totalClaimable.toFixed(2)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Claimed</p>
              <p className="text-lg font-semibold">
                ${totalClaimed.toFixed(2)}
              </p>
            </div>
          </Card>
          
          <Card>
            <div className="space-y-1">
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">Lifetime</p>
              <p className="text-lg font-semibold">
                ${lifetimeEarnings.toFixed(2)}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Income by Asset */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Income by Asset
          </h3>
          
          <div className="space-y-3">
            {mockIncome.map((income) => (
              <Card key={income.assetId} padding="none">
                <div className="p-4 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{income.assetName}</h3>
                      <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                        {income.tokensOwned} tokens
                      </p>
                    </div>
                    <Badge variant="success" size="sm">
                      {income.monthlyRate}% monthly
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgb(var(--color-border))] text-sm">
                    <div>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Claimable</p>
                      <p className="font-medium text-green-400">${income.claimable.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Total Claimed</p>
                      <p className="font-medium">${income.claimed.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {income.claimable > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={() => handleClaim(income.assetId)}
                      disabled={claiming === income.assetId}
                    >
                      {claiming === income.assetId ? 'Claiming...' : `Claim $${income.claimable.toFixed(2)}`}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Distribution Ledger */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              Distribution History
            </h3>
            <button className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-400">
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
          
          <div className="space-y-2">
            {distributionHistory.map((distribution) => (
              <Card key={distribution.id} padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1">{distribution.assetName}</p>
                    <div className="flex items-center gap-3 text-xs text-[rgb(var(--color-text-secondary))]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(distribution.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span className="font-mono">{distribution.txHash}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-green-400">+${distribution.amount.toFixed(2)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Info Card */}
        <Card className="bg-blue-500/5 border-blue-500/20">
          <div className="flex gap-3">
            <DollarSign className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
              <p className="font-medium text-blue-400">About Income Distributions</p>
              <p>
                Income is distributed monthly based on asset performance. Claim your earnings anytime to receive them in your wallet.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
