import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  ExternalLink, 
  RefreshCw, 
  XCircle, 
  Package,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/Button';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  amount: number;
  currency: string;
  customer_name: string;
  customer_email: string;
  stripe_payment_intent_id: string;
  refund_status: string;
  product?: {
    name: string;
  };
}

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:product_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => 
    order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600 mt-1">Manage customer transactions and refunds</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order #, email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              />
            </div>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Order Details</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Customer</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{order.order_number}</div>
                      <div className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{order.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {getStatusBadge(order.status)}
                        {order.refund_status !== 'none' && (
                          <span className="inline-flex items-center text-[10px] font-bold uppercase text-red-600">
                            Refunded
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title="Quick View"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Quick View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOrder.order_number}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {new Date(selectedOrder.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Status</p>
                {getStatusBadge(selectedOrder.status)}
                {selectedOrder.refund_status !== 'none' && (
                  <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refunded
                  </span>
                )}
              </div>

              {/* Customer */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Customer</p>
                <p className="font-semibold text-gray-900">{selectedOrder.customer_name || 'N/A'}</p>
                <p className="text-sm text-gray-600">{selectedOrder.customer_email}</p>
              </div>

              {/* Amount */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Amount</p>
                <p className="text-2xl font-bold text-primary">
                  ${selectedOrder.amount.toFixed(2)} {selectedOrder.currency}
                </p>
              </div>

              {/* Payment Details */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Payment Intent</p>
                <p className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded">
                  {selectedOrder.stripe_payment_intent_id}
                </p>
              </div>

              {/* Date */}
              <div>
                <p className="text-sm text-gray-600 mb-2">Order Date</p>
                <p className="text-gray-900">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <Link to={`/portal/orders/${selectedOrder.id}`} className="flex-1">
                  <Button className="w-full">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    View Full Details
                  </Button>
                </Link>
                <Button
                  onClick={() => setSelectedOrder(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManager;
