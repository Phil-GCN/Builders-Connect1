import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { ShoppingCart, BookOpen, ArrowRight, Clock, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const activeProducts = (data || []).filter(product => {
        // Check if product should be archived
        if (product.archive_date && new Date(product.archive_date) < new Date()) {
          return false;
        }
        return true;
      });

      setProducts(activeProducts);
      
      // Set first product with campaign as featured
      const featured = activeProducts.find(p => p.campaign_data);
      setFeaturedProduct(featured || activeProducts[0] || null);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveCampaign = (product: Product) => {
    if (!product.campaign_data) return false;
    if (product.campaign_data.end_date && new Date(product.campaign_data.end_date) < new Date()) {
      return false;
    }
    return true;
  };

  const getCampaignBadge = (product: Product) => {
    if (!product.campaign_data || !hasActiveCampaign(product)) return null;
    return product.campaign_data.badge || 'Special Offer';
  };

  const getDisplayPrice = (product: Product) => {
    if (product.campaign_data?.discount_price && hasActiveCampaign(product)) {
      return product.campaign_data.discount_price;
    }
    return product.price;
  };

  const getOriginalPrice = (product: Product) => {
    if (product.campaign_data?.original_price && hasActiveCampaign(product)) {
      return product.campaign_data.original_price;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Shop
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
            Books, courses, and resources to help you build wealth, freedom, and legacy
          </p>
        </div>
      </div>

      {/* Featured Product Campaign Banner */}
      {featuredProduct && hasActiveCampaign(featuredProduct) && (
        <div className="bg-gradient-to-r from-primary to-secondary py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm font-semibold">{getCampaignBadge(featuredProduct)}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{featuredProduct.name}</h2>
                <p className="text-xl mb-6 opacity-90">{featuredProduct.description}</p>
                
                {featuredProduct.campaign_data?.bonus && (
                  <div className="bg-white/10 border border-white/30 rounded-xl p-4 mb-6">
                    <p className="text-sm font-semibold mb-1">Special Bonus:</p>
                    <p className="text-sm">{featuredProduct.campaign_data.bonus}</p>
                  </div>
                )}

                <div className="flex items-baseline gap-4 mb-6">
                  <div className="text-5xl font-bold">${getDisplayPrice(featuredProduct)}</div>
                  {getOriginalPrice(featuredProduct) && (
                    <div className="text-2xl line-through opacity-60">${getOriginalPrice(featuredProduct)}</div>
                  )}
                  {featuredProduct.campaign_data?.launch_date && (
                    <div className="flex items-center gap-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>Launches {new Date(featuredProduct.campaign_data.launch_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Link to={`/shop/${featuredProduct.slug}`}>
                    <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Order Now
                    </Button>
                  </Link>
                  <Link to={`/shop/${featuredProduct.slug}`}>
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                      View Details
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-[3/4] bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl">
                  {featuredProduct.image_url ? (
                    <img 
                      src={featuredProduct.image_url} 
                      alt={featuredProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-32 h-32 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Products Grid */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">All Products</h2>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No products available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  to={`/shop/${product.slug}`}
                  className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary transition-all duration-300"
                >
                  {/* Product Image */}
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Campaign Badge */}
                    {getCampaignBadge(product) && (
                      <div className="absolute top-4 right-4 bg-accent text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        {getCampaignBadge(product)}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    {/* Pricing */}
                    <div className="flex items-baseline gap-3 mb-4">
                      <div className="text-3xl font-bold text-primary">
                        ${getDisplayPrice(product)}
                      </div>
                      {getOriginalPrice(product) && (
                        <>
                          <div className="text-xl text-gray-400 line-through">
                            ${getOriginalPrice(product)}
                          </div>
                          <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">
                            Save ${(getOriginalPrice(product)! - getDisplayPrice(product))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3">
                      <Button className="flex-1" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
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
