import React, { useState } from 'react';
import { Button } from './Button';
import { ShoppingCart, Loader } from 'lucide-react';
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
    // Check if user is logged in
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      // Get Stripe instance
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // Call Supabase Edge Function to create checkout session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ productId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error.message || 'Something went wrong. Please try again.');
    } finally {
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
          Processing...
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
