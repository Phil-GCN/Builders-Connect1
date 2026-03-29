import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useAuth } from '../../hooks/useAuth';

// Dashboard Pages
import Dashboard from './Dashboard';
import UsersManager from './UsersManager';
import ProductsManager from './ProductsManager';
import ContentManager from './ContentManager';
import CommunityManager from './CommunityManager';
import OrdersManager from './OrdersManager';
import OrderDetails from './OrderDetails';
import Analytics from './Analytics';
import SettingsManager from '../admin/Settings';

const Portal: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  function Portal() {
    return (
      <Routes>
        <Route path="/" element={<PortalLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<UsersManager />} />
          <Route path="products" element={<ProductsManager />} />
          <Route path="orders" element={<OrdersManager />} />
          <Route path="orders/:id" element={<OrderDetails />} />  {/* ADD THIS */}
          <Route path="content" element={<ContentManager />} />
          <Route path="community" element={<Community />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

export default Portal;
