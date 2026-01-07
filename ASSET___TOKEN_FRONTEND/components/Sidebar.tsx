import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  ShoppingBag, 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  History,
  Droplets,
  DollarSign,
  Menu,
  X,
  Hexagon
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  className?: string
  isOpen?: boolean
  onToggle?: () => void
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Marketplace', href: '/marketplace', icon: ShoppingBag },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Swap', href: '/swap', icon: TrendingUp },
  { name: 'Liquidity', href: '/pool', icon: Droplets },
  { name: 'Primary Sale', href: '/sale', icon: DollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'History', href: '/history', icon: History },
]

export function Sidebar({ className, isOpen, onToggle }: SidebarProps) {
  const location = useLocation()
  
  return (
    <div className={`flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-800 ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800">
        <Link to="/" className="flex items-center space-x-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Hexagon className="w-6 h-6 text-blue-500" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            AssetToken
          </span>
        </Link>
        {onToggle && (
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-500/10 text-blue-400 shadow-lg shadow-blue-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-6 border-t border-slate-800">
        <div className="px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-400">Connected to Network</span>
          </div>
          <p className="text-xs text-slate-500">
            Backend: localhost:5000
          </p>
        </div>
      </div>
    </div>
  )
}
