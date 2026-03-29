import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useAuth } from '../../hooks/useAuth';

// Dashboard Pages
import Dashboard from './Dashboard';
import UsersManager from './UsersManager';
import ProductsManager from './ProductsManager';
import OrdersManager from './OrdersManager';
import OrderDetails from './OrderDetails';  // ADD THIS
import ContentManager from './ContentManager';
import Community from './Community';
import Analytics from './Analytics';
import Settings from '../admin/Settings';

const Portal: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <PortalLayout>
      <Routes>
        {/* 'index' is the default view when at /portal */}
        <Route index element={<Dashboard />} />
        
        {/* Sub-routes under /portal */}
        <Route path="users" element={<UsersManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="content" element={<ContentManager />} />
        <Route path="community" element={<CommunityManager />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<SettingsManager />} />

        {/* IMPORTANT: If no sub-route matches, just show the Dashboard 
          instead of a hard redirect which causes blank screens.
        */}
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </PortalLayout>
  );
};

export default Portal;
