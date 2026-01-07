import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount, useBalance } from 'wagmi';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Upload, Wallet, DollarSign, TrendingUp, Shield } from 'lucide-react';
import { mockPortfolio } from '../data/mockData';

export const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { address, isConnected, chain } = useAccount();
  const { data: balance } = useBalance({ address });
  
  const totalPortfolioValue = mockPortfolio.reduce((sum, item) => sum + item.value, 0);
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Redirect if not connected
  React.useEffect(() => {
    if (!isConnected) {
      navigate('/connect-wallet');
    }
  }, [isConnected, navigate]);
  
  const quickActions = [
    { icon: Search, label: 'Browse', color: 'text-blue-500', path: '/marketplace' },
    { icon: Upload, label: 'List Asset', color: 'text-green-500', path: '/list-asset' },
    { icon: Wallet, label: 'Portfolio', color: 'text-purple-500', path: '/portfolio' },
    { icon: DollarSign, label: 'Income', color: 'text-amber-500', path: '/income' },
  ];
  
  return (
    <Layout title="AssetToken">
      <div className="px-4 py-6 space-y-6">
        {/* Wallet Info Card */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">
                  Wallet Address
                </p>
                <p className="font-mono text-sm">{address ? shortenAddress(address) : 'Not Connected'}</p>
              </div>
              <Badge variant="success" size="sm">
                ✓ Connected
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 pt-2 border-t border-[rgb(var(--color-border))]">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-[rgb(var(--color-text-secondary))]">
                  {chain?.name || 'Unknown Network'}
                </span>
              </div>
              {balance && (
                <div className="ml-auto text-xs">
                  Balance: {parseFloat(balance.formatted).toFixed(4)} {balance.symbol}
                </div>
              )}
            </div>
          </div>
        </Card>
        
        {/* Portfolio Value */}
        <Card>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
              <TrendingUp className="w-4 h-4" />
              <p className="text-xs">Total Portfolio Value</p>
            </div>
            <h2 className="text-3xl font-semibold">
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <p className="text-xs text-green-400">
              {mockPortfolio.length} {mockPortfolio.length === 1 ? 'asset' : 'assets'}
            </p>
          </div>
        </Card>
        
        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Card
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className={`p-3 rounded-xl bg-[rgb(var(--color-bg-hover))] ${action.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
              Your Holdings
            </h3>
            <button
              onClick={() => navigate('/portfolio')}
              className="text-xs text-blue-500 hover:text-blue-400"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-2">
            {mockPortfolio.slice(0, 2).map((holding) => (
              <Card
                key={holding.assetId}
                onClick={() => navigate(`/asset/${holding.assetId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{holding.assetName}</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                      {holding.tokensOwned} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">
                      ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <Badge variant="success" size="sm">{holding.status}</Badge>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Security Notice */}
        <Card className="bg-gray-500/5 border-gray-500/20">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
              <p className="font-medium text-[rgb(var(--color-text-primary))]">
                Trust & Verification
              </p>
              <p>
                All assets undergo legal verification and on-chain deployment before becoming available for purchase.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
