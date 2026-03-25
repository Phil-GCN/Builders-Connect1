import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { useProducts } from '../../hooks/useProducts';
import { ShoppingCart, Clock } from 'lucide-react';

const Shop: React.FC = () => {
  const { products, loading } = useProducts();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Shop</h1>
            <p className="text-xl text-gray-600">
              Strategic frameworks and tools for intentional builders
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                    {product.is_pre_order && (
                      <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Pre-Order
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                    {product.subtitle && (
                      <p className="text-gray-600 text-sm mb-4">{product.subtitle}</p>
                    )}
                    <p className="text-gray-700 mb-6 line-clamp-3">{product.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {product.features.slice(0, 3).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                          </div>
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      {product.is_pre_order && product.pre_order_price ? (
                        <div>
                          <span className="text-3xl font-bold text-primary">${product.pre_order_price}</span>
                          <span className="text-gray-500 line-through ml-2">${product.price}</span>
                          <p className="text-xs text-gray-500 mt-1">Pre-order price</p>
                        </div>
                      ) : (
                        <span className="text-3xl font-bold text-gray-900">${product.price}</span>
                      )}
                    </div>

                    {product.is_pre_order && product.pre_order_bonus && (
                      <div className="bg-accent/10 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Bonus:</span> {product.pre_order_bonus}
                        </p>
                      </div>
                    )}

                    <Button className="w-full flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      {product.is_pre_order ? 'Pre-Order Now' : 'Add to Cart'}
                    </Button>

                    {product.is_pre_order && product.pre_order_launch_date && (
                      <p className="text-xs text-gray-500 text-center mt-3">
                        Available: {new Date(product.pre_order_launch_date).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
