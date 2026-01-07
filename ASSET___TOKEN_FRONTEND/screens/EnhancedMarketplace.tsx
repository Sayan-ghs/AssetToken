import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, TrendingUp, MapPin, DollarSign } from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { tokenApi } from '../services/api'
import { motion } from 'framer-motion'

export function MarketplaceScreen() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const { data: assets, isLoading } = useQuery({
    queryKey: ['marketplace-assets'],
    queryFn: tokenApi.getAll,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  })

  const categories = [
    { id: 'all', label: 'All Assets' },
    { id: 'real-estate', label: 'Real Estate' },
    { id: 'art', label: 'Art & Collectibles' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'bonds', label: 'Bonds' },
  ]

  const mockAssets = [
    {
      id: '1',
      name: 'Downtown Manhattan Office',
      type: 'Real Estate',
      price: 50000,
      totalValue: 2500000,
      return: 8.5,
      location: 'New York, USA',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
      available: 45,
      total: 100,
    },
    {
      id: '2',
      name: 'Vintage Art Collection',
      type: 'Art',
      price: 25000,
      totalValue: 500000,
      return: 12.3,
      location: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400',
      available: 15,
      total: 20,
    },
    {
      id: '3',
      name: 'Gold Reserve Fund',
      type: 'Commodities',
      price: 10000,
      totalValue: 1000000,
      return: 6.2,
      location: 'Global',
      image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400',
      available: 80,
      total: 100,
    },
    {
      id: '4',
      name: 'Luxury Beachfront Villa',
      type: 'Real Estate',
      price: 75000,
      totalValue: 5000000,
      return: 9.1,
      location: 'Miami, USA',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400',
      available: 25,
      total: 50,
    },
    {
      id: '5',
      name: 'Corporate Bonds Portfolio',
      type: 'Bonds',
      price: 5000,
      totalValue: 750000,
      return: 5.8,
      location: 'Global',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
      available: 120,
      total: 150,
    },
    {
      id: '6',
      name: 'Rare Wine Collection',
      type: 'Collectibles',
      price: 15000,
      totalValue: 300000,
      return: 11.5,
      location: 'Bordeaux, France',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
      available: 10,
      total: 20,
    },
  ]

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || asset.type.toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Asset Marketplace</h1>
        <p className="text-slate-400">Discover and invest in tokenized real-world assets</p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-800"
          />
        </div>
        <Button variant="outline" className="sm:w-auto">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </motion.div>

      {/* Categories */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={filterType === category.id ? 'primary' : 'outline'}
            onClick={() => setFilterType(category.id)}
            className="whitespace-nowrap"
          >
            {category.label}
          </Button>
        ))}
      </motion.div>

      {/* Assets Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-slate-800 rounded-t-xl" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-slate-800 rounded" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="h-4 bg-slate-800 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map((asset, index) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card 
                className="group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer border border-slate-800 overflow-hidden"
                onClick={() => navigate(`/asset/${asset.id}`)}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={asset.image}
                    alt={asset.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="default" className="bg-black/60 backdrop-blur-sm">
                      {asset.type}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="success" className="bg-green-500/20 text-green-400 backdrop-blur-sm">
                      +{asset.return}% APY
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">
                      {asset.name}
                    </h3>
                    <div className="flex items-center text-sm text-slate-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      {asset.location}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Price per token</span>
                      <span className="font-bold">${asset.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Available</span>
                      <span className="text-green-400">{asset.available}/{asset.total}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Total Value</span>
                      <span className="font-bold">${(asset.totalValue / 1000000).toFixed(2)}M</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Funding Progress</span>
                      <span>{Math.round((asset.total - asset.available) / asset.total * 100)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300"
                        style={{ width: `${(asset.total - asset.available) / asset.total * 100}%` }}
                      />
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/purchase/${asset.id}`)
                    }}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Invest Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {filteredAssets.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400">No assets found matching your criteria</p>
        </motion.div>
      )}
    </div>
  )
}
