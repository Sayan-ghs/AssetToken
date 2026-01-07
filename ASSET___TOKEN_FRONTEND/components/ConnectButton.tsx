import { useConnect, useAccount } from 'wagmi'
import { Button } from './ui/button'
import { Wallet } from 'lucide-react'

export function ConnectButton() {
  const { connect, connectors, isPending } = useConnect()
  const { isConnected } = useAccount()

  if (isConnected) return null

  return (
    <div className="flex items-center space-x-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          disabled={isPending}
          variant="primary"
          className="flex items-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>{isPending ? 'Connecting...' : 'Connect Wallet'}</span>
        </Button>
      ))}
    </div>
  )
}
