import { useAccount, useDisconnect } from 'wagmi'
import { Menu, Wallet, LogOut, Bell } from 'lucide-react'
import { Button } from './ui/button'
import { ConnectButton } from './ConnectButton'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Real World Asset Platform
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Bell className="w-5 h-5 text-slate-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
          </button>

          {/* Wallet */}
          {isConnected && address ? (
            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 border border-slate-700">
                <Wallet className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-mono text-slate-300">
                  {shortenAddress(address)}
                </span>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors text-slate-400"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </header>
  )
}
