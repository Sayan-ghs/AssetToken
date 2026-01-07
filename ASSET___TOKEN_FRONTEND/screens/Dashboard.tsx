import { useAccount, useBalance } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  TrendingUp, 
  Wallet, 
  DollarSign, 
  BarChart3, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShoppingBag
} from 'lucide-react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { tokenApi } from '../services/api'
import { motion } from 'framer-motion'

export function HomeScreen() {
  const { address, isConnected } = useAccount()
  const navigate = useNavigate()
  const { data: balance } = useBalance({ address })

  const { data: assets } = useQuery({
    queryKey: ['assets'],
    queryFn: tokenApi.getAll,
    enabled: isConnected,
  })

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 max-w-md text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-slate-400 mb-6">
              Please connect your wallet to access the platform
            </p>
          </Card>
        </motion.div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Total Balance',
      value: `${Number(balance?.formatted || 0).toFixed(4)} ${balance?.symbol || 'ETH'}`,
      change: '+12.5%',
      isPositive: true,
      icon: Wallet,
      color: 'blue'
    },
    {
      label: 'Portfolio Value',
      value: '$45,234.50',
      change: '+8.2%',
      isPositive: true,
      icon: DollarSign,
      color: 'green'
    },
    {
      label: 'Total Assets',
      value: assets?.data?.length || 0,
      change: '+2',
      isPositive: true,
      icon: BarChart3,
      color: 'purple'
    },
    {
      label: 'Monthly Income',
      value: '$1,234.00',
      change: '-2.1%',
      isPositive: false,
      icon: TrendingUp,
      color: 'orange'
    },
  ]

  const recentActivity = [
    { type: 'buy', asset: 'Real Estate Token #123', amount: '+50 tokens', time: '2 hours ago' },
    { type: 'income', asset: 'Dividend Payment', amount: '+$125.50', time: '1 day ago' },
    { type: 'sell', asset: 'Art NFT #456', amount: '-10 tokens', time: '2 days ago' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-slate-400">
          Connected: <span className="font-mono text-blue-400">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${stat.color}-500/10`}>
                    <Icon className={`w-6 h-6 text-${stat.color}-500`} />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{stat.change}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card className="p-6 border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/marketplace')}
              className="flex flex-col items-center space-y-2 h-auto py-4 hover:bg-blue-500/10 hover:border-blue-500 transition-all"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Browse Assets</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/portfolio')}
              className="flex flex-col items-center space-y-2 h-auto py-4 hover:bg-purple-500/10 hover:border-purple-500 transition-all"
            >
              <Wallet className="w-6 h-6" />
              <span>Portfolio</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/list-asset')}
              className="flex flex-col items-center space-y-2 h-auto py-4 hover:bg-green-500/10 hover:border-green-500 transition-all"
            >
              <TrendingUp className="w-6 h-6" />
              <span>List Asset</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/transactions')}
              className="flex flex-col items-center space-y-2 h-auto py-4 hover:bg-orange-500/10 hover:border-orange-500 transition-all"
            >
              <Clock className="w-6 h-6" />
              <span>Transactions</span>
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card className="p-6 border border-slate-800">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'buy' ? 'bg-green-500' :
                    activity.type === 'sell' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <p className="font-medium">{activity.asset}</p>
                    <p className="text-sm text-slate-400">{activity.time}</p>
                  </div>
                </div>
                <p className={`font-mono ${
                  activity.amount.startsWith('+') ? 'text-green-500' : 'text-slate-300'
                }`}>
                  {activity.amount}
                </p>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate('/transactions')}
            className="w-full mt-4 hover:bg-slate-800"
          >
            View All Transactions
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}
