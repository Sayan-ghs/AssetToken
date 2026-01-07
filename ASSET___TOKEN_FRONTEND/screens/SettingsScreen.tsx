import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Network,
  Bell,
  Mail,
  FileText,
  Shield,
  Info,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { mockUser } from '../data/mockData';

export const SettingsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [network, setNetwork] = useState<'Mainnet' | 'Sepolia'>(mockUser.network);
  const [notifications, setNotifications] = useState({
    income: true,
    transactions: true,
    assetUpdates: true,
    marketing: false,
  });
  
  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  return (
    <Layout title="Settings" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* Account Section */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Account
          </h3>
          
          <Card>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">
                  Wallet Address
                </p>
                <p className="font-mono text-sm">{shortenAddress(mockUser.walletAddress)}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-[rgb(var(--color-border))]">
                <div>
                  <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-1">
                    KYC Status
                  </p>
                  <p className="text-sm">
                    {mockUser.kycStatus === 'verified' ? 'Verified' : 'Pending'}
                  </p>
                </div>
                <Badge variant={mockUser.kycStatus === 'verified' ? 'success' : 'warning'}>
                  {mockUser.kycStatus === 'verified' ? '✓ Verified' : 'Pending'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Network Section */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Network
          </h3>
          
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">Network Selection</h3>
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-[rgb(var(--color-bg-hover))] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="network"
                      value="Mainnet"
                      checked={network === 'Mainnet'}
                      onChange={(e) => setNetwork(e.target.value as 'Mainnet')}
                      className="w-4 h-4 text-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium">Ethereum Mainnet</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Production network</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </label>
                
                <label className="flex items-center justify-between p-3 bg-[rgb(var(--color-bg-hover))] rounded-lg cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="network"
                      value="Sepolia"
                      checked={network === 'Sepolia'}
                      onChange={(e) => setNetwork(e.target.value as 'Sepolia')}
                      className="w-4 h-4 text-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium">Sepolia Testnet</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">Test network</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                </label>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Notifications Section */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Notifications
          </h3>
          
          <Card>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <h3 className="font-medium">Notification Preferences</h3>
              </div>
              
              <div className="space-y-3">
                {[
                  { key: 'income', label: 'Income Distributions', description: 'Get notified when income is available' },
                  { key: 'transactions', label: 'Transactions', description: 'Updates on your transactions' },
                  { key: 'assetUpdates', label: 'Asset Updates', description: 'Important asset-related updates' },
                  { key: 'marketing', label: 'Marketing', description: 'Promotional content and updates' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center justify-between py-2 border-b border-[rgb(var(--color-border))] last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium mb-0.5">{item.label}</p>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">{item.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-blue-500"
                    />
                  </label>
                ))}
              </div>
            </div>
          </Card>
        </div>
        
        {/* Contact Information */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Contact Information
          </h3>
          
          <div className="space-y-2">
            <Card onClick={() => {}} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                      {mockUser.email || 'Not provided'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              </div>
            </Card>
          </div>
        </div>
        
        {/* Legal & Compliance */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            Legal & Compliance
          </h3>
          
          <div className="space-y-2">
            <Card onClick={() => {}} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  <span className="text-sm">Terms of Service</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              </div>
            </Card>
            
            <Card onClick={() => {}} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  <span className="text-sm">Privacy Policy</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              </div>
            </Card>
            
            <Card onClick={() => {}} padding="sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
                  <span className="text-sm">Compliance Information</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
              </div>
            </Card>
          </div>
        </div>
        
        {/* App Info */}
        <Card>
          <div className="text-center space-y-1">
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">AssetToken v1.0.0</p>
            <p className="text-xs text-[rgb(var(--color-text-secondary))]">
              © 2026 AssetToken. All rights reserved.
            </p>
          </div>
        </Card>
        
        {/* Disconnect Wallet */}
        <Button
          variant="danger"
          size="lg"
          fullWidth
          onClick={() => navigate('/')}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </Button>
      </div>
    </Layout>
  );
};
