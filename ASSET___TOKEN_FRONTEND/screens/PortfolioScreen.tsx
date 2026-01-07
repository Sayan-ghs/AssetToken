import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Wallet, TrendingUp, Package } from 'lucide-react';
import { mockUser, mockPortfolio } from '../data/mockData';

export const PortfolioScreen: React.FC = () => {
  const navigate = useNavigate();
  
  const totalValue = mockPortfolio.reduce((sum, item) => sum + item.value, 0);
  const totalTokens = mockPortfolio.reduce((sum, item) => sum + item.tokensOwned, 0);
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <Layout title="Portfolio">
      <div className="px-4 py-6 space-y-6">
        {/* Portfolio Header */}
        <Card>
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs">Total Portfolio Value</p>
            </div>
            
            <div>
              <h2 className="text-3xl font-semibold mb-2">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h2>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                {mockPortfolio.length} {mockPortfolio.length === 1 ? 'asset' : 'assets'} • {totalTokens} total tokens
              </p>
            </div>
            
            <div className="pt-3 border-t border-[rgb(var(--color-border))] flex items-center justify-between">
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Wallet Address</p>
                <p className="font-mono text-sm">{shortenAddress(mockUser.walletAddress)}</p>
              </div>
              <Badge variant="success" size="sm">
                {mockUser.kycStatus === 'verified' ? '✓ KYC Verified' : 'KYC Pending'}
              </Badge>
            </div>
          </div>
        </Card>
        
        {/* Holdings */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Holdings
          </h3>
          
          {mockPortfolio.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="w-12 h-12 text-[rgb(var(--color-text-secondary))] mx-auto mb-4" />
              <h3 className="font-medium mb-2">No assets yet</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))] max-w-xs mx-auto mb-6">
                You don't own any asset tokens yet. Browse the marketplace to get started.
              </p>
              <button
                onClick={() => navigate('/marketplace')}
                className="text-sm text-blue-500 hover:text-blue-400"
              >
                Browse Marketplace
              </button>
            </Card>
          ) : (
            <div className="space-y-3">
              {mockPortfolio.map((holding) => (
                <Card
                  key={holding.assetId}
                  onClick={() => navigate(`/asset/${holding.assetId}`)}
                  padding="none"
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{holding.assetName}</h3>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                          {holding.tokensOwned} tokens
                        </p>
                      </div>
                      <Badge
                        variant={holding.status === 'active' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {holding.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[rgb(var(--color-border))]">
                      <div>
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Current Value</p>
                        <p className="font-medium">
                          ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Price per Token</p>
                        <p className="font-medium">
                          ${(holding.value / holding.tokensOwned).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => navigate('/transactions')}>
            <div className="text-center py-4">
              <p className="text-sm font-medium mb-1">Transaction History</p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">View all transactions</p>
            </div>
          </Card>
          <Card onClick={() => navigate('/income')}>
            <div className="text-center py-4">
              <p className="text-sm font-medium mb-1">Income</p>
              <p className="text-xs text-[rgb(var(--color-text-secondary))]">View distributions</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
