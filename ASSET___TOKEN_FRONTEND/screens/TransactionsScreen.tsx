import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Download, ExternalLink, ArrowUpRight, ArrowDownRight, DollarSign, XCircle } from 'lucide-react';
import { mockTransactions } from '../data/mockData';
import { Transaction } from '../types';

export const TransactionsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell' | 'claim' | 'failed'>('all');
  
  const filteredTransactions = mockTransactions.filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'failed') return tx.status === 'failed';
    return tx.type === filter;
  });
  
  const getTransactionIcon = (type: Transaction['type'], status: Transaction['status']) => {
    if (status === 'failed') return XCircle;
    switch (type) {
      case 'buy':
        return ArrowDownRight;
      case 'sell':
        return ArrowUpRight;
      case 'claim':
        return DollarSign;
      default:
        return ArrowDownRight;
    }
  };
  
  const getTransactionColor = (type: Transaction['type'], status: Transaction['status']) => {
    if (status === 'failed') return 'text-red-500';
    switch (type) {
      case 'buy':
        return 'text-blue-500';
      case 'sell':
        return 'text-purple-500';
      case 'claim':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="success" size="sm">Success</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">Pending</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">Failed</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <Layout title="Transactions" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* Export Button */}
        <div className="flex justify-end">
          <Button variant="secondary" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {[
            { value: 'all', label: 'All' },
            { value: 'buy', label: 'Buy' },
            { value: 'claim', label: 'Claim' },
            { value: 'failed', label: 'Failed' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === item.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        {/* Transaction List */}
        <div>
          <p className="text-xs text-[rgb(var(--color-text-secondary))] mb-3 px-1">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
          </p>
          
          {filteredTransactions.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                No transactions found
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((transaction) => {
                const Icon = getTransactionIcon(transaction.type, transaction.status);
                const color = getTransactionColor(transaction.type, transaction.status);
                
                return (
                  <Card key={transaction.id} padding="sm">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-[rgb(var(--color-bg-hover))] ${color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm mb-0.5">{transaction.assetName}</p>
                              <p className="text-xs text-[rgb(var(--color-text-secondary))] capitalize">
                                {transaction.type}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-medium text-sm mb-0.5">
                                ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </p>
                              {getStatusBadge(transaction.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {transaction.status === 'failed' && transaction.reason && (
                        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-2">
                          <p className="text-xs text-red-400">{transaction.reason}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 border-t border-[rgb(var(--color-border))] text-xs">
                        <span className="text-[rgb(var(--color-text-secondary))]">
                          {new Date(transaction.date).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {transaction.txHash && (
                          <button className="flex items-center gap-1 text-blue-500 hover:text-blue-400">
                            <span className="font-mono">{transaction.txHash}</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      
                      {transaction.fee > 0 && (
                        <div className="text-xs text-[rgb(var(--color-text-secondary))]">
                          Fee: ${transaction.fee.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
