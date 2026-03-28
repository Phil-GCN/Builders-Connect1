import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Package, FileText, ShoppingCart, BarChart3, Settings, 
  LogOut, Menu, X, ChevronDown, MessageSquare, BookOpen 
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, hasMinimumRole, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/portal',
    },
    {
      id: 'users',
      label: 'Users Manager',
      icon: Users,
      path: '/portal/users',
      requiredLevel: 3, // Content Manager and above
    },
    {
      id: 'products',
      label: 'Products Manager',
      icon: Package,
      path: '/portal/products',
      requiredLevel: 3,
    },
    {
      id: 'content',
      label: 'Content Manager',
      icon: FileText,
      path: '/portal/content',
      requiredLevel: 3,
    },
    {
      id: 'community',
      label: 'Community',
      icon: MessageSquare,
      path: '/portal/community',
      requiredLevel: 2, // Moderator and above
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/portal/analytics',
      requiredLevel: 3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/portal/settings',
      requiredLevel: 4, // Super Admin only
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingCart, // Import from lucide-react
      path: '/portal/orders',
      requiredLevel: 3,
    },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    if (item.requiredLevel && !hasMinimumRole(item.requiredLevel)) {
      return false;
    }
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return false;
    }
    return true;
  });

  const isActive = (path: string) => {
    if (path === '/portal') {
      return location.pathname === '/portal';
    }
    return location.pathname.startsWith(path);
  };

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
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? 'lg:w-64' : 'lg:w-20'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
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

        {/* User Info */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role_display_name}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
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
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
          <aside className="fixed inset-y-0 left-0 w-64 bg-white" onClick={(e) => e.stopPropagation()}>
            {/* User Info */}
            <div className="p-4 border-b border-gray-200 mt-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.role_display_name}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Navigation */}
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
                          active
                            ? 'bg-primary text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`lg:pl-64 transition-all duration-300 ${
          !sidebarOpen ? 'lg:pl-20' : ''
        }`}
      >
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
};
