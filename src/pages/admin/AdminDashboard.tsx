import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/Navbar';
import { BarChart3, Users, ShoppingCart, Mail, Settings } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Check if user has admin access
  const isAdmin = profile?.role === 'SUPER_ADMIN' || profile?.role === 'CONTENT_MANAGER' || profile?.role === 'MODERATOR';

  if (!isAdmin) {
    return <Navigate to="/portal" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your platform • Role: {profile?.role}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-600">Total Users</h3>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-2">+0 this month</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-600">Orders</h3>
                <ShoppingCart className="w-5 h-5 text-secondary" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-2">$0 revenue</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-600">Subscribers</h3>
                <Mail className="w-5 h-5 text-accent" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-2">Newsletter</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-600">Analytics</h3>
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-sm text-gray-500 mt-2">Page views</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Content Management</h3>
              <ul className="space-y-3">
                <li><button className="text-primary hover:underline">Manage Products</button></li>
                <li><button className="text-primary hover:underline">Write Blog Post</button></li>
                <li><button className="text-primary hover:underline">Newsletter Studio</button></li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Requests & Forms</h3>
              <ul className="space-y-3">
                <li><button className="text-primary hover:underline">Speaking Requests (0)</button></li>
                <li><button className="text-primary hover:underline">Podcast Requests (0)</button></li>
                <li><button className="text-primary hover:underline">Press Inquiries (0)</button></li>
              </ul>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-lg mb-4">Community</h3>
              <ul className="space-y-3">
                <li><button className="text-primary hover:underline">Moderate Posts</button></li>
                <li><button className="text-primary hover:underline">Manage Users</button></li>
                <li><button className="text-primary hover:underline">Flagged Content (0)</button></li>
              </ul>
            </div>
          </div>

          {/* Pre-Order Control */}
          {profile?.role === 'SUPER_ADMIN' && (
            <div className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-8 h-8 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900">Pre-Order Settings</h2>
              </div>
              <p className="text-gray-600 mb-4">Control your "Built to Last" pre-order campaign</p>
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90">
                Manage Pre-Order →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
