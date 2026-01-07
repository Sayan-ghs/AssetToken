import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MapPin, CheckCircle, FileText, Activity, Droplet, AlertCircle, ExternalLink } from 'lucide-react';
import { mockAssets } from '../data/mockData';

export const AssetDetailScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
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
  
  const canPurchase = 
    asset.verified &&
    asset.availableSupply > 0 &&
    asset.oracleStatus === 'active' &&
    asset.liquidityPool.available;
  
  const getOracleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'stale': return 'warning';
      case 'paused': return 'error';
      default: return 'neutral';
    }
  };
  
  return (
    <Layout showBack>
      <div className="space-y-4">
        {/* Hero Image */}
        <div className="h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-b border-[rgb(var(--color-border))]">
          <div className="text-6xl">🏢</div>
        </div>
        
        <div className="px-4 space-y-4 pb-6">
          {/* Asset Overview */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl mb-2">{asset.name}</h1>
                <div className="flex items-center gap-2 text-[rgb(var(--color-text-secondary))]">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{asset.location}</span>
                </div>
              </div>
              {asset.verified && (
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="neutral">{asset.type.replace('-', ' ').toUpperCase()}</Badge>
              {asset.verified && <Badge variant="success">✓ Verified</Badge>}
            </div>
          </div>
          
          {/* Legal Summary */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">Legal Summary</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="text-[rgb(var(--color-text-secondary))]">Document Hash (IPFS)</span>
                  <button className="text-blue-500 hover:text-blue-400 flex items-center gap-1">
                    <span className="font-mono text-xs">{asset.documentHash.slice(0, 12)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-[rgb(var(--color-text-secondary))]">Verification Status</span>
                  <Badge variant="success" size="sm">Complete</Badge>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Oracle Status */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">Oracle Status</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="text-[rgb(var(--color-text-secondary))]">Price Oracle</span>
                  <Badge variant={getOracleStatusColor(asset.oracleStatus)} size="sm">
                    {asset.oracleStatus}
                  </Badge>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="text-[rgb(var(--color-text-secondary))]">Last Updated</span>
                  <span className="text-[rgb(var(--color-text-primary))]">
                    {new Date(asset.lastOracleUpdate).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-[rgb(var(--color-text-secondary))]">Proof of Reserve</span>
                  <span className="text-green-400">✓ Verified</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Tokenomics */}
          <Card>
            <div className="space-y-3">
              <h3 className="font-medium">Tokenomics</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Token Symbol</p>
                  <p className="font-medium">{asset.tokenSymbol}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Decimals</p>
                  <p className="font-medium">{asset.decimals}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Total Supply</p>
                  <p className="font-medium">{asset.totalSupply.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Available</p>
                  <p className="font-medium">{asset.availableSupply.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="pt-3 border-t border-[rgb(var(--color-border))]">
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Price per Token</p>
                <p className="text-2xl font-semibold">${asset.pricePerToken.toLocaleString()}</p>
              </div>
              
              {asset.monthlyRate && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-0.5">Monthly Distribution Rate</p>
                  <p className="text-green-400 font-medium">{asset.monthlyRate}%</p>
                </div>
              )}
            </div>
          </Card>
          
          {/* AMM Pool Info */}
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">AMM Pool Info</h3>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="text-[rgb(var(--color-text-secondary))]">Liquidity</span>
                  <span className="text-[rgb(var(--color-text-primary))] font-medium">
                    ${asset.liquidityPool.liquidity.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-b border-[rgb(var(--color-border))]">
                  <span className="text-[rgb(var(--color-text-secondary))]">Pool Status</span>
                  <Badge variant={asset.liquidityPool.available ? 'success' : 'error'} size="sm">
                    {asset.liquidityPool.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                
                <div className="py-2">
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">Price Source</p>
                  <p className="text-[rgb(var(--color-text-primary))]">{asset.liquidityPool.priceSource}</p>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Warning States */}
          {!canPurchase && asset.availableSupply > 0 && (
            <Card className="bg-amber-500/5 border-amber-500/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm space-y-1">
                  <p className="font-medium text-amber-500">Purchase Currently Unavailable</p>
                  <p className="text-[rgb(var(--color-text-secondary))]">
                    {asset.oracleStatus !== 'active'
                      ? 'Oracle verification required before purchase.'
                      : !asset.liquidityPool.available
                      ? 'Liquidity pool unavailable.'
                      : 'Asset verification in progress.'}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {asset.availableSupply === 0 && (
            <Card className="bg-gray-500/5 border-gray-500/20">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[rgb(var(--color-text-primary))]">Sold Out</p>
                  <p className="text-[rgb(var(--color-text-secondary))]">
                    All tokens for this asset have been sold.
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* CTA */}
          <div className="sticky bottom-20 pt-4">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              disabled={!canPurchase}
              onClick={() => navigate(`/purchase/${asset.id}`)}
            >
              {asset.availableSupply === 0
                ? 'Sold Out'
                : !canPurchase
                ? 'Purchase Unavailable'
                : 'Proceed to Purchase'}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};
