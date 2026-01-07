import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { HomeScreen as Dashboard } from './screens/Dashboard';
import { MarketplaceScreen as Marketplace } from './screens/EnhancedMarketplace';
import { AssetDetailScreen } from './screens/AssetDetailScreen';
import { PurchaseScreen } from './screens/PurchaseScreen';
import { PortfolioScreen } from './screens/PortfolioScreen';
import { IncomeScreen } from './screens/IncomeScreen';
import { TransactionsScreen } from './screens/TransactionsScreen';
import { ListAssetScreen } from './screens/ListAssetScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { AdminPanelScreen } from './screens/AdminPanelScreen';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="asset/:id" element={<AssetDetailScreen />} />
          <Route path="purchase/:id" element={<PurchaseScreen />} />
          <Route path="portfolio" element={<PortfolioScreen />} />
          <Route path="income" element={<IncomeScreen />} />
          <Route path="transactions" element={<TransactionsScreen />} />
          <Route path="list-asset" element={<ListAssetScreen />} />
          <Route path="notifications" element={<NotificationsScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="admin" element={<AdminPanelScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;