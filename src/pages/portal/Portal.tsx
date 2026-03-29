import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useAuth } from '../../hooks/useAuth';
import Notifications from './Notifications';

// Dashboard Pages
import Dashboard from './Dashboard';
import UsersManager from './UsersManager';
import ProductsManager from './ProductsManager';
import OrdersManager from './OrdersManager';
import OrderDetails from './OrderDetails';
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
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="content" element={<ContentManager />} />
        <Route path="community" element={<Community />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Dashboard />} />
        <Route path="notifications" element={<Notifications />} />
      </Routes>
    </PortalLayout>
  );
};

export default Portal;
