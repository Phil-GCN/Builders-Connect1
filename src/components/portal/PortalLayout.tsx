import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, FileText, ShoppingCart, BarChart3, Settings, 
  LogOut, Menu, X, MessageSquare, Bell, Shield 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  requiredLevel?: number;
  requiredPermission?: string;
}

interface PortalLayoutProps {
  children: React.ReactNode;
}

export const PortalLayout: React.FC<PortalLayoutProps> = ({ children }) => {
  // 1. Hooks
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, hasMinimumRole, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userLevel = user?.role_level || 1;

  // 2. Methods & Logic
  const loadUnreadCount = async () => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      
      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
      setUnreadCount(0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

  // 3. Effects
  useEffect(() => {
    if (user?.id) {
      loadUnreadCount();
      
      const subscription = supabase
        .channel('notifications_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, () => {
          loadUnreadCount();
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  // 4. Data Structures (Main Menu Only)
  const menuItems: MenuItem[] = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/portal' 
    },
    { 
      id: 'users', 
      label: 'Users Manager', 
      icon: Users, 
      path: '/portal/users', 
      requiredLevel: 3 
    },
    { 
      id: 'products', 
      label: 'Products Manager', 
      icon: Package, 
      path: '/portal/products', 
      requiredLevel: 3 
    },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ShoppingCart, 
      path: '/portal/orders', 
      requiredLevel: 3 
    },
    { 
      id: 'content', 
      label: 'Content Manager', 
      icon: FileText, 
      path: '/portal/content', 
      requiredLevel: 3 
    },
    { 
      id: 'community', 
      label: 'Community', 
      icon: MessageSquare, 
      path: '/portal/community', 
      requiredLevel: 2 
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      path: '/portal/analytics', 
      requiredLevel: 3 
    }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiredLevel && !hasMinimumRole(item.requiredLevel)) return false;
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) return false;
    return true;
  });

  // 5. Render
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="text-xl font-bold text-primary">
              BUILDERSCONNECT
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
             <Link
              to="/portal/communications"
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
          {sidebarOpen && (
            <Link to="/" className="text-xl font-bold text-primary">
              BUILDERSCONNECT
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg ml-auto"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Clickable Profile Section */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <button
            onClick={() => navigate('/portal/profile')}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left overflow-hidden"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.full_name || user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            )}
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Fixed Footer Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          {/* Communications Link with Badge */}
          <Link
            to="/portal/communications"
            className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-colors relative ${
              isActive('/portal/communications') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              <Bell className="w-5 h-5 flex-shrink-0" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            {sidebarOpen && <span className="font-medium">{userLevel >= 3 ? 'Communications' : 'Support'}</span>}
          </Link>

          {/* Settings Link (for Admins) */}
          {userLevel >= 4 && (
            <Link
              to="/portal/settings"
              className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-lg transition-colors ${
                isActive('/portal/settings') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Settings</span>}
            </Link>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 mt-16">
              <button
                onClick={() => { navigate('/portal/profile'); setMobileMenuOpen(false); }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.full_name || user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </button>
            </div>
            <nav className="p-4">
              <ul className="space-y-1">
                {filteredMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <li key={item.id}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          active ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
                {/* Mobile specific Links for footer items */}
                <li>
                  <Link
                    to="/portal/communications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/portal/communications') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span className="font-medium">{userLevel >= 3 ? 'Communications' : 'Support'}</span>
                  </Link>
                </li>
                {userLevel >= 4 && (
                  <li>
                    <Link
                      to="/portal/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive('/portal/settings') ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="w-5 h-5" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className={`lg:pl-64 transition-all duration-300 ${!sidebarOpen ? 'lg:pl-20' : ''}`}>
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};
