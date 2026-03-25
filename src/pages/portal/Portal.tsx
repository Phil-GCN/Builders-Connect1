import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { User, BookOpen, MessageSquare, Settings } from 'lucide-react';

const Portal: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Welcome back, {profile?.name}!</h1>
            <p className="text-gray-600 mt-2">Your personal dashboard</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full"></div>
                <div>
                  <h3 className="font-bold text-lg">{profile?.name}</h3>
                  <p className="text-sm text-gray-600">{profile?.role}</p>
                </div>
              </div>
              <button className="w-full mt-4 text-primary font-semibold text-sm flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-primary" />
                <h3 className="font-bold text-lg">My Library</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Access your purchased books and resources</p>
              <button className="text-primary font-semibold text-sm">View Library →</button>
            </div>

            {/* Community */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-secondary" />
                <h3 className="font-bold text-lg">Community</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">Join discussions with fellow builders</p>
              <button className="text-secondary font-semibold text-sm">Go to Community →</button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <p className="text-gray-600">No recent activity yet. Start exploring!</p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Portal;
