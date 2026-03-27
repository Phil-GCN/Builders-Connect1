import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LogOut } from 'lucide-react'; // Add to imports
import { supabase } from '../lib/supabase'; // Add import
import { useNavigate } from 'react-router-dom'; // Add import

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };
 
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-primary">
            BUILDERSCONNECT
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">About</Link>
              <Link to="/podcast" className="text-gray-700 hover:text-primary transition-colors">Podcast</Link>
              <Link to="/shop" className="text-gray-700 hover:text-primary transition-colors">Shop</Link>
              <Link to="/community" className="text-gray-700 hover:text-primary transition-colors">Community</Link>
              <Link to="/resources" className="text-gray-700 hover:text-primary transition-colors">Resources</Link>
            </div>
          </div>

          {/* Auth Buttons - Single Combined Button */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to={user.role === 'super_admin' ? '/admin' : '/portal'}>
                  <Button variant="outline" size="sm">
                    {user.role === 'super_admin' ? 'Admin' : 'Portal'}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            <Link to="/about" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>About</Link>
            <Link to="/podcast" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Podcast</Link>
            <Link to="/shop" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Shop</Link>
            <Link to="/community" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Community</Link>
            <Link to="/resources" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Resources</Link>
            {user ? (
              <Link to="/portal" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Portal</Link>
            ) : (
              <Link to="/login" className="block text-gray-700 hover:text-primary" onClick={() => setIsOpen(false)}>Sign In</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
