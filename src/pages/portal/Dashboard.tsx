import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Users, Package, FileText, TrendingUp, UserPlus } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userLevel = user?.role_level || 1;

  // Get display name - prefer full_name, then username, fallback to email first part
  const getDisplayName = () => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.username) {
      return user.username;
    }
    // Extract name from email (everything before @)
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter for a cleaner look
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return 'there';
  };

  const stats = [
    { label: 'Total Users', value: '1,234', icon: Users, color: 'bg-blue-500' },
    { label: 'Active Products', value: '12', icon: Package, color: 'bg-green-500' },
    { label: 'Blog Posts', value: '45', icon: FileText, color: 'bg-purple-500' },
    { label: 'Revenue', value: '$12.5K', icon: TrendingUp, color: 'bg-orange-500' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {getDisplayName()}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your platform today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Conditional Invite Friends Card for Members/Moderators (Level 1 & 2) */}
            {userLevel < 3 && (
              <button
                onClick={() => navigate('/portal/invitations')}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-primary hover:bg-primary/5 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <UserPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Invite Friends</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Share Builders Connect with your network
                </p>
              </button>
            )}

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <p className="font-semibold text-gray-900">Invite User</p>
              <p className="text-sm text-gray-600 mt-1">Send invitation to new user</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <p className="font-semibold text-gray-900">Add Product</p>
              <p className="text-sm text-gray-600 mt-1">Create new product listing</p>
            </button>
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left">
              <p className="font-semibold text-gray-900">Write Post</p>
              <p className="text-sm text-gray-600 mt-1">Publish new blog content</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
