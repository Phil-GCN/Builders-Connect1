import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ShoppingCart, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [paymentLink, setPaymentLink] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch payment link from database
    const fetchPaymentLink = async () => {
      const { data } = await supabase
        .from('products')
        .select('stripe_payment_link')
        .eq('id', productId)
        .single();

      if (data?.stripe_payment_link) {
        setPaymentLink(data.stripe_payment_link);
      }
    };

    fetchPaymentLink();
  }, [productId]);

  const handleCheckout = async () => {
    // Check if user is logged in
    if (!user) {
      navigate('/login?redirect=' + window.location.pathname);
      return;
    }

    setLoading(true);

    try {
      if (!paymentLink) {
        alert('Payment link not configured for this product. Please contact support.');
        setLoading(false);
        return;
      }

      // Append customer email to payment link (pre-fill)
      const linkWithEmail = `${paymentLink}?prefilled_email=${encodeURIComponent(user.email)}`;
      
      // Open Stripe Payment Link
      window.location.href = linkWithEmail;
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // If no payment link configured, show coming soon
  if (!paymentLink) {
    return (
      <Button
        disabled={true}
        size={size}
        className={className}
      >
        <ShoppingCart className="w-5 h-5 mr-2" />
        Coming Soon
      </Button>
    );
  }

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
