import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConnect, useAccount } from 'wagmi';
import { Hexagon, Wallet, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export const ConnectWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const [showContactModal, setShowContactModal] = useState(false);
  const { connect, connectors, isPending } = useConnect();
  const { isConnected } = useAccount();
  
  useEffect(() => {
    if (isConnected) {
      setShowContactModal(true);
    }
  }, [isConnected]);
  
  const wallets = [
    { name: 'MetaMask', icon: '🦊', connector: connectors[0], available: true },
    { name: 'WalletConnect', icon: '🔗', connector: connectors[1], available: true },
  ];
  
  const handleConnect = (connector: any) => {
    if (connector) {
      connect({ connector });
    }
  };
  
  const handleSkipContact = () => {
    navigate('/home');
  };
  
  const handleSubmitContact = () => {
    navigate('/home');
  };
  
  if (showContactModal) {
    return (
      <div className="min-h-screen flex flex-col px-6 py-8 bg-[rgb(var(--color-bg-dark))]">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl mb-2">Optional Contact Details</h2>
            <p className="text-[rgb(var(--color-text-secondary))] text-sm">
              Provide contact information to receive important asset-related notifications.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-[rgb(var(--color-text-secondary))] mb-1.5">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[rgb(var(--color-text-secondary))] mb-1.5">
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            
            <label className="flex items-start gap-3 py-2">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 rounded border-[rgb(var(--color-border))] bg-[rgb(var(--color-bg-card))] text-blue-500 focus:ring-2 focus:ring-blue-500/50"
              />
              <span className="text-sm text-[rgb(var(--color-text-secondary))]">
                I agree to receive important asset-related notifications
              </span>
            </label>
          </div>
          
          <div className="space-y-3">
            <Button variant="primary" size="lg" fullWidth onClick={handleSubmitContact}>
              Submit
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={handleSkipContact}>
              Skip for now
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col px-6 py-8 bg-[rgb(var(--color-bg-dark))]">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Hexagon className="w-16 h-16 text-blue-500" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl mb-3">AssetToken</h1>
          <p className="text-[rgb(var(--color-text-secondary))] text-sm">
            Connect your wallet to access verified real-world assets
          </p>
        </div>
        
        <div className="space-y-3 mb-8">
          {wallets.map((wallet) => (
            <Card key={wallet.name} padding="none">
              <button
                onClick={() => handleConnect(wallet.connector)}
                className="w-full flex items-center justify-between p-4 text-left"
                disabled={!wallet.available || isPending}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{wallet.icon}</span>
                  <span className="font-medium">{wallet.name}</span>
                </div>
                {!isPending && <ChevronRight className="w-5 h-5 text-[rgb(var(--color-text-secondary))]" />}
                {isPending && <span className="text-xs">Connecting...</span>}
              </button>
            </Card>
          ))}
        </div>
        
        <div className="space-y-4">
          <Card className="bg-blue-500/5 border-blue-500/20">
            <div className="text-sm space-y-2">
              <p className="text-blue-400 font-medium">Network Requirement</p>
              <p className="text-[rgb(var(--color-text-secondary))]">
                This application supports Ethereum Mainnet and Sepolia testnet.
              </p>
            </div>
          </Card>
          
          <div className="text-center text-xs text-[rgb(var(--color-text-secondary))] space-y-1">
            <p className="font-medium">Your wallet is your identity.</p>
            <p>No email or password required.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
