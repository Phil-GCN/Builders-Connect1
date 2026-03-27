import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button';
import { Product } from '../../types';
import { 
  Plus, Edit2, Trash2, Eye, EyeOff, Search, 
  ExternalLink, DollarSign, Package, Loader 
} from 'lucide-react';

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      loadProducts();
      alert('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <Loader className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Products Manager</h1>
            <p className="text-gray-600 mt-2">
              Manage your products, pricing, and availability
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-5 h-5 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                <p className="text-sm text-gray-600">Total Products</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => p.is_active).length}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <EyeOff className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {products.filter(p => !p.is_active).length}
                </p>
                <p className="text-sm text-gray-600">Inactive</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  ${products.reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">Total Value</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment Link</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? 'No products found matching your search' : 'No products yet. Click "Add Product" to create your first product.'}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-sm text-gray-600">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {product.product_type || 'digital'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">${product.price}</p>
                        {product.campaign_data?.discount_price && (
                          <p className="text-sm text-green-600">
                            Sale: ${product.campaign_data.discount_price}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.is_active ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <Eye className="w-3 h-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {product.stripe_payment_link ? (
                          <a href={product.stripe_payment_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(product.id, product.is_active)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={product.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {product.is_active ? (
                              <EyeOff className="w-5 h-5 text-gray-600" />
                            ) : (
                              <Eye className="w-5 h-5 text-gray-600" />
                            )}
                          </button>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-5 h-5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id, product.name)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(showAddModal || editingProduct) && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowAddModal(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            loadProducts();
            setShowAddModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
};

export default ProductsManager;

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSave: () => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price || 0,
    product_type: product?.product_type || 'digital',
    image_url: product?.image_url || '',
    stripe_payment_link: product?.stripe_payment_link || '',
    is_active: product?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: product ? prev.slug : generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formData]);

        if (error) throw error;
        alert('Product created successfully!');
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="Built to Last: The Modern Guide..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Slug *
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="built-to-last"
            />
            <p className="text-sm text-gray-500 mt-1">
              Will be used in URL: /shop/{formData.slug}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="A comprehensive guide to building generational wealth..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (USD) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                placeholder="24.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type *
              </label>
              <select
                value={formData.product_type}
                onChange={(e) => setFormData(prev => ({ ...prev, product_type: e.target.value as any }))}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              >
                <option value="book">Book</option>
                <option value="course">Course</option>
                <option value="digital">Digital Product</option>
                <option value="physical">Physical Product</option>
                <option value="membership">Membership</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="https://example.com/product-image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stripe Payment Link
            </label>
            <input
              type="url"
              value={formData.stripe_payment_link}
              onChange={(e) => setFormData(prev => ({ ...prev, stripe_payment_link: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              placeholder="https://buy.stripe.com/test_..."
            />
            <p className="text-sm text-gray-500 mt-1">
              
                href="https://dashboard.stripe.com/test/payment-links"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Create payment link in Stripe →
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Product is active and visible on shop page
            </label>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
