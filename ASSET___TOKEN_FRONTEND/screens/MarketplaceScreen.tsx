import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Search, Filter, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { mockAssets } from '../data/mockData';
import { Asset } from '../types';
import { tokenApi } from '../services/api';

export const MarketplaceScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    verified: true,
    available: false,
  });
  
  // Try to fetch from API, fallback to mock data
  const { data: apiAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      try {
        const response = await tokenApi.getAll();
        return response.data;
      } catch (error) {
        console.log('API not available, using mock data');
        return null;
      }
    },
    retry: 1,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false, // Don't refetch when tab comes back to focus
    refetchOnMount: false, // Don't refetch on component remount
  });
  
  const assets = apiAssets || mockAssets;
  
  const filteredAssets = assets.filter((asset: Asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filters.type === 'all' || asset.type === filters.type;
    const matchesVerified = !filters.verified || asset.verified;
    const matchesAvailable = !filters.available || asset.availableSupply > 0;
    
    return matchesSearch && matchesType && matchesVerified && matchesAvailable;
  });
  
  return (
    <Layout title="Marketplace">
      <div className="px-4 py-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[rgb(var(--color-text-secondary))]" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        
        {/* Filter Button */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-2 bg-[rgb(var(--color-bg-card))] border border-[rgb(var(--color-border))] rounded-lg text-sm hover:bg-[rgb(var(--color-bg-hover))] transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          {filters.available && (
            <Badge variant="primary">Available only</Badge>
          )}
        </div>
        
        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Asset Type</p>
                <div className="space-y-2">
                  {['all', 'real-estate', 'commodity', 'infrastructure', 'art'].map((type) => (
                    <label key={type} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        checked={filters.type === type}
                        onChange={() => setFilters({ ...filters, type })}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-sm capitalize">{type === 'all' ? 'All Types' : type.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="border-t border-[rgb(var(--color-border))] pt-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.verified}
                    onChange={(e) => setFilters({ ...filters, verified: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <span className="text-sm">Verified only</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={filters.available}
                    onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-500"
                  />
                  <span className="text-sm">Available supply &gt; 0</span>
                </label>
              </div>
            </div>
          </Card>
        )}
        
        {/* Results Count */}
        <p className="text-xs text-[rgb(var(--color-text-secondary))] px-1">
          {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
        </p>
        
        {/* Asset List */}
        {filteredAssets.length === 0 ? (
          <Card className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[rgb(var(--color-text-secondary))] mx-auto mb-4" />
            <h3 className="font-medium mb-2">No verified assets available yet</h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] max-w-xs mx-auto">
              Assets appear only after full legal verification and on-chain deployment.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} onClick={() => navigate(`/asset/${asset.id}`)} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

interface AssetCardProps {
  asset: Asset;
  onClick: () => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onClick }) => {
  return (
    <Card onClick={onClick} className="overflow-hidden" padding="none">
      {/* Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border-b border-[rgb(var(--color-border))]">
        <div className="text-4xl">🏢</div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium flex-1">{asset.name}</h3>
            {asset.verified && (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            )}
          </div>
          
          <div className="flex items-center gap-1.5 text-[rgb(var(--color-text-secondary))]">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-xs">{asset.location}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="neutral" size="sm">
            {asset.type.replace('-', ' ').toUpperCase()}
          </Badge>
          {asset.availableSupply === 0 && (
            <Badge variant="warning" size="sm">Sold Out</Badge>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--color-border))]">
          <div>
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-0.5">Price per token</p>
            <p className="font-medium">${asset.pricePerToken.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-0.5">Available</p>
            <p className="font-medium">{asset.availableSupply} / {asset.totalSupply}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
