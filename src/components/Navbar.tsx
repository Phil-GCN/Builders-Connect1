import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/supabase';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">BUILDERSCONNECT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-gray-700 hover:text-primary transition-colors">About</Link>
            <Link to="/podcast" className="text-gray-700 hover:text-primary transition-colors">Podcast</Link>
            <Link to="/shop" className="text-gray-700 hover:text-primary transition-colors">Shop</Link>
            <Link to="/community" className="text-gray-700 hover:text-primary transition-colors">Community</Link>
            <Link to="/resources" className="text-gray-700 hover:text-primary transition-colors">Resources</Link>
            <Link to="/work-with-us" className="text-gray-700 hover:text-primary transition-colors">Work With Us</Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/portal" className="flex items-center space-x-2 text-gray-700 hover:text-primary">
                  <User className="w-5 h-5" />
                  <span>{profile?.name || 'Portal'}</span>
                </Link>
                <button onClick={handleSignOut} className="text-gray-700 hover:text-primary">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary">Login</Link>
                <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-4 space-y-3">
            <Link to="/about" className="block text-gray-700 hover:text-primary">About</Link>
            <Link to="/podcast" className="block text-gray-700 hover:text-primary">Podcast</Link>
            <Link to="/shop" className="block text-gray-700 hover:text-primary">Shop</Link>
            <Link to="/community" className="block text-gray-700 hover:text-primary">Community</Link>
            <Link to="/resources" className="block text-gray-700 hover:text-primary">Resources</Link>
            <Link to="/work-with-us" className="block text-gray-700 hover:text-primary">Work With Us</Link>
            {user ? (
              <>
                <Link to="/portal" className="block text-gray-700 hover:text-primary">Portal</Link>
                <button onClick={handleSignOut} className="block w-full text-left text-gray-700 hover:text-primary">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-primary">Login</Link>
                <Link to="/signup" className="block text-gray-700 hover:text-primary">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
