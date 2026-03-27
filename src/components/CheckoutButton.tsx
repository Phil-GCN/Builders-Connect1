import React, { useState } from 'react';
import { Button } from './Button';
import { ShoppingCart, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getStripe } from '../lib/stripe';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface CheckoutButtonProps {
  productId: string;
  productName: string;
  price: number;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  productId,
  productName,
  price,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      // Call Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          productId,
          userId: user.id 
        },
      });

      if (error) throw error;

      if (!data?.url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={disabled || loading}
      size={size}
      className={`${className} ${loading ? 'opacity-75' : ''}`}
    >
      {loading ? (
        <>
          <Loader className="w-5 h-5 mr-2 animate-spin" />
          Redirecting...
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5 mr-2" />
          {user ? `Pre-Order Now - $${price}` : 'Sign In to Pre-Order'}
        </>
      )}
    </Button>
  );
};
