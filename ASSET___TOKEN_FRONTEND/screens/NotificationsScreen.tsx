import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { CheckCircle, DollarSign, AlertTriangle, ShoppingCart, Bell } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { Notification } from '../types';

export const NotificationsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'approval':
        return CheckCircle;
      case 'purchase':
        return ShoppingCart;
      case 'income':
        return DollarSign;
      case 'claim':
        return DollarSign;
      case 'warning':
        return AlertTriangle;
      default:
        return Bell;
    }
  };
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'approval':
        return 'text-green-500';
      case 'purchase':
        return 'text-blue-500';
      case 'income':
        return 'text-green-500';
      case 'claim':
        return 'text-green-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };
  
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    setNotifications(
      notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      )
    );
    
    // Navigate if actionUrl exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
  const unreadCount = notifications.filter((n) => !n.read).length;
  
  return (
    <Layout title="Notifications" showBack>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[rgb(var(--color-text-secondary))]">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
          {unreadCount > 0 && (
            <button
              onClick={() =>
                setNotifications(notifications.map((n) => ({ ...n, read: true })))
              }
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              Mark all as read
            </button>
          )}
        </div>
        
        {/* Notifications List */}
        {notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell className="w-12 h-12 text-[rgb(var(--color-text-secondary))] mx-auto mb-4" />
            <h3 className="font-medium mb-2">No notifications</h3>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
              You're all caught up!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const color = getNotificationColor(notification.type);
              
              return (
                <Card
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  padding="sm"
                  className={notification.read ? 'opacity-60' : ''}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg bg-[rgb(var(--color-bg-hover))] ${color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm flex-1">{notification.message}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="text-xs text-[rgb(var(--color-text-secondary))]">
                        {new Date(notification.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};
