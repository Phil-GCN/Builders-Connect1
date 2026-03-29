import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { 
  ArrowLeft, Package, User, CreditCard, Calendar, 
  RefreshCw, Download, ExternalLink, AlertCircle,
  CheckCircle, Clock, XCircle, Loader
} from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  product_id: string;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  refund_status: string;
  refund_amount: number | null;
  refund_reason: string | null;
  refunded_at: string | null;
  stripe_payment_intent_id: string;
  stripe_checkout_session_id: string;
  created_at: string;
  paid_at: string;
  product?: {
    name: string;
    slug: string;
    image_url: string;
  };
  user?: {
    email: string;
    full_name: string;
  };
}

const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(name, slug, image_url),
          user:users(email, full_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error loading order:', error);
      alert('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!refundReason.trim()) {
      alert('Please provide a reason for the refund');
      return;
    }
  
    // Get current user for audit trail
    const { data: { user } } = await supabase.auth.getUser();
  
    setRefunding(true);
    try {
      const response = await fetch('/api/process-refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          reason: refundReason,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Refund failed');
      }

      alert('Refund processed successfully!');
      setShowRefundModal(false);
      loadOrder();
    } catch (error: any) {
      console.error('Refund error:', error);
      alert(error.message || 'Failed to process refund');
    } finally {
      setRefunding(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    };

    const icons = {
      completed: CheckCircle,
      pending: Clock,
      processing: Loader,
      failed: XCircle,
    };

    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    const style = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${style}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link to="/portal/orders">
            <Button>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canRefund = order.status === 'completed' && order.refund_status === 'none';

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/portal/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{order.order_number}</h1>
              <p className="text-gray-600 mt-1">
                Order placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {getStatusBadge(order.status)}
            {canRefund && (
              <Button
                onClick={() => setShowRefundModal(true)}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Issue Refund
              </Button>
            )}
          </div>
        </div>

        {/* Refund Notice */}
        {order.refund_status !== 'none' && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <RefreshCw className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Order Refunded</h3>
                <p className="text-red-700 text-sm mb-2">
                  ${order.refund_amount?.toFixed(2)} refunded on {new Date(order.refunded_at!).toLocaleDateString()}
                </p>
                {order.refund_reason && (
                  <p className="text-red-600 text-sm">
                    <strong>Reason:</strong> {order.refund_reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-8">
            {/* Product Details */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Product Details
              </h2>
              <div className="flex gap-4">
                {order.product?.image_url && (
                  <img
                    src={order.product.image_url}
                    alt={order.product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">
                    {order.product?.name || 'Product'}
                  </h3>
                  <p className="text-2xl font-bold text-primary mb-2">
                    ${order.amount.toFixed(2)} {order.currency}
                  </p>
                  {order.product?.slug && (
                    <Link
                      to={`/shop/${order.product.slug}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Product <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-6 h-6" />
                Customer Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Name</p>
                  <p className="font-semibold text-gray-900">{order.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-semibold text-gray-900">{order.customer_email}</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Payment Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Payment Intent</p>
                  <p className="font-mono text-sm text-gray-900">{order.stripe_payment_intent_id}</p>
                  
                    <a 
                      href="https://dashboard.stripe.com/..."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="..."
                    >
                      View in Stripe <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Checkout Session</p>
                  <p className="font-mono text-sm text-gray-900">{order.stripe_checkout_session_id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Order Placed</p>
                    <p className="text-xs text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {order.paid_at && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Payment Completed</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.paid_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {order.refunded_at && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <RefreshCw className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">Refund Issued</p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.refunded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={loadOrder}
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Order
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Issue Refund</h2>
            <p className="text-gray-600 mb-6">
              This will refund <strong>${order.amount.toFixed(2)}</strong> to the customer's original payment method.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Refund *
              </label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                rows={4}
                placeholder="Enter the reason for this refund..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowRefundModal(false)}
                variant="outline"
                className="flex-1"
                disabled={refunding}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRefund}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={refunding}
              >
                {refunding ? (
                  <>
                    <Loader className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Confirm Refund
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
