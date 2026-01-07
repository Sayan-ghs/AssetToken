import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  WifiOff,
  Network,
  AlertTriangle,
  Droplet,
  Pause,
  Loader,
} from 'lucide-react';

type ErrorType =
  | 'wallet-disconnected'
  | 'wrong-network'
  | 'oracle-stale'
  | 'liquidity-unavailable'
  | 'asset-paused'
  | 'indexing';

export const ErrorStateScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const errorType = (searchParams.get('type') as ErrorType) || 'wallet-disconnected';
  
  const errorConfig: Record<
    ErrorType,
    {
      icon: React.ComponentType<{ className?: string }>;
      title: string;
      description: string;
      action: string;
      color: string;
    }
  > = {
    'wallet-disconnected': {
      icon: WifiOff,
      title: 'Wallet Disconnected',
      description:
        'Your wallet has been disconnected. Please reconnect to continue using the application.',
      action: 'Reconnect Wallet',
      color: 'text-red-500',
    },
    'wrong-network': {
      icon: Network,
      title: 'Wrong Network',
      description:
        'You are connected to an unsupported network. Please switch to Ethereum Mainnet or Sepolia testnet.',
      action: 'Switch Network',
      color: 'text-amber-500',
    },
    'oracle-stale': {
      icon: AlertTriangle,
      title: 'Oracle Data Stale',
      description:
        'The price oracle has not been updated recently. Purchases are temporarily disabled until fresh data is available.',
      action: 'Check Status',
      color: 'text-amber-500',
    },
    'liquidity-unavailable': {
      icon: Droplet,
      title: 'Liquidity Unavailable',
      description:
        'The liquidity pool for this asset is currently unavailable. Please try again later or contact support.',
      action: 'Back to Marketplace',
      color: 'text-red-500',
    },
    'asset-paused': {
      icon: Pause,
      title: 'Asset Paused',
      description:
        'This asset has been temporarily paused by administrators. Trading and distributions are currently disabled.',
      action: 'Back to Portfolio',
      color: 'text-red-500',
    },
    'indexing': {
      icon: Loader,
      title: 'Indexing in Progress',
      description:
        'The blockchain data is currently being indexed. Some features may be temporarily unavailable. Please wait a few moments and try again.',
      action: 'Retry',
      color: 'text-blue-500',
    },
  };
  
  const config = errorConfig[errorType];
  const Icon = config.icon;
  
  const handleAction = () => {
    switch (errorType) {
      case 'wallet-disconnected':
        navigate('/connect-wallet');
        break;
      case 'liquidity-unavailable':
        navigate('/marketplace');
        break;
      case 'asset-paused':
        navigate('/portfolio');
        break;
      default:
        navigate(-1);
        break;
    }
  };
  
  return (
    <Layout showBack>
      <div className="px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className={`w-16 h-16 bg-[rgb(var(--color-bg-card))] rounded-full flex items-center justify-center mb-6 ${config.color}`}>
          <Icon className="w-10 h-10" />
        </div>
        
        <h2 className="text-xl mb-2 text-center">{config.title}</h2>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] text-center max-w-xs mb-8">
          {config.description}
        </p>
        
        <Card className="w-full max-w-sm mb-6 bg-gray-500/5 border-gray-500/20">
          <div className="space-y-2 text-sm">
            <p className="font-medium text-[rgb(var(--color-text-primary))]">Next Steps</p>
            <ul className="list-disc list-inside text-[rgb(var(--color-text-secondary))] space-y-1">
              {errorType === 'wallet-disconnected' && (
                <>
                  <li>Reconnect your wallet</li>
                  <li>Ensure you're on the correct network</li>
                </>
              )}
              {errorType === 'wrong-network' && (
                <>
                  <li>Open your wallet extension</li>
                  <li>Switch to Mainnet or Sepolia</li>
                  <li>Refresh the page</li>
                </>
              )}
              {errorType === 'oracle-stale' && (
                <>
                  <li>Wait for oracle to update</li>
                  <li>Check back in a few minutes</li>
                  <li>Contact support if issue persists</li>
                </>
              )}
              {errorType === 'liquidity-unavailable' && (
                <>
                  <li>Try a different asset</li>
                  <li>Check back later</li>
                  <li>Contact support for assistance</li>
                </>
              )}
              {errorType === 'asset-paused' && (
                <>
                  <li>Check notifications for updates</li>
                  <li>View other assets in your portfolio</li>
                  <li>Contact support for more information</li>
                </>
              )}
              {errorType === 'indexing' && (
                <>
                  <li>Wait a few moments</li>
                  <li>Refresh the page</li>
                  <li>Try again</li>
                </>
              )}
            </ul>
          </div>
        </Card>
        
        <Button variant="primary" size="lg" fullWidth onClick={handleAction} className="max-w-sm">
          {config.action}
        </Button>
      </div>
    </Layout>
  );
};
