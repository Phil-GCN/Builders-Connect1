import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { 
  ShoppingCart, BookOpen, CheckCircle, Clock, Star, Shield, 
  Download, Gift, TrendingUp, Users 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import { CheckoutButton } from '../../components/CheckoutButton';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      loadProduct(slug);
    }
  }, [slug]);

  const loadProduct = async (productSlug: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', productSlug)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        setNotFound(true);
        return;
      }

      // Check if product should be archived
      if (data.archive_date && new Date(data.archive_date) < new Date()) {
        setNotFound(true);
        return;
      }

      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveCampaign = () => {
    if (!product?.campaign_data) return false;
    if (product.campaign_data.end_date && new Date(product.campaign_data.end_date) < new Date()) {
      return false;
    }
    return true;
  };

  const getDisplayPrice = () => {
    if (product?.campaign_data?.discount_price && hasActiveCampaign()) {
      return product.campaign_data.discount_price;
    }
    return product?.price || 0;
  };

  const getOriginalPrice = () => {
    if (product?.campaign_data?.original_price && hasActiveCampaign()) {
      return product.campaign_data.original_price;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return <Navigate to="/shop" replace />;
  }

  const sections = product.page_sections?.sections || [];
  const heroSection = sections.find(s => s.type === 'hero' && s.enabled);
  const partsSection = sections.find(s => s.type === 'parts' && s.enabled);
  const featuresSection = sections.find(s => s.type === 'features' && s.enabled);
  const authorBioSection = sections.find(s => s.type === 'author_bio' && s.enabled);
  const testimonialsSection = sections.find(s => s.type === 'testimonials' && s.enabled);
  const faqSection = sections.find(s => s.type === 'faq' && s.enabled);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Product Image */}
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden shadow-2xl">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-32 h-32 text-primary" />
                  </div>
                )}
              </div>
              
              {/* Campaign Badge */}
              {hasActiveCampaign() && product.campaign_data?.badge && (
                <div className="absolute -top-4 -right-4 bg-accent text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg">
                  {product.campaign_data.badge}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {product.campaign_data?.launch_date && (
                <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-primary">
                    Launching {new Date(product.campaign_data.launch_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                {heroSection?.data?.title || product.name}
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {heroSection?.data?.description || product.description}
              </p>

              {/* Pricing Box */}
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <div className="flex items-baseline gap-4 mb-6">
                  <div>
                    <div className="text-5xl font-bold text-primary">${getDisplayPrice()}</div>
                    <div className="text-sm text-gray-500">
                      {hasActiveCampaign() ? 'Pre-order price' : 'Current price'}
                    </div>
                  </div>
                  {getOriginalPrice() && (
                    <>
                      <div className="text-gray-400">
                        <div className="text-2xl line-through">${getOriginalPrice()}</div>
                        <div className="text-sm">Launch price</div>
                      </div>
                      <div className="ml-auto">
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                          Save ${getOriginalPrice()! - getDisplayPrice()}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Bonus */}
                {product.campaign_data?.bonus && hasActiveCampaign() && (
                  <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Gift className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-gray-900 mb-1">Special Bonus</p>
                        <p className="text-sm text-gray-600">{product.campaign_data.bonus}</p>
                      </div>
                    </div>
                  </div>
                )}

                <CheckoutButton
                  productId={product.id}
                  productName={product.name}
                  price={getDisplayPrice()}
                  size="lg"
                  className="w-full"
                />
                
                <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>100% Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>

              {/* Trust Signals */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary mb-1">10K+</div>
                  <div className="text-xs text-gray-600">Readers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-secondary mb-1">4.9★</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent mb-1">16</div>
                  <div className="text-xs text-gray-600">Chapters</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parts/Chapters Section */}
      {partsSection && (
        <div className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What's Inside
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Four comprehensive sections covering everything you need
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {partsSection.data?.map((part: any, idx: number) => (
                <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{part.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{part.chapters}</p>
                  <p className="text-gray-600">{part.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      {featuresSection && (
        <div className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                More than just theory - actionable frameworks you can implement immediately
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuresSection.data?.map((feature: string, idx: number) => (
                <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-6">
                  <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-gray-700 font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Author Bio Section */}
      {authorBioSection && product.author_bio && (
        <div className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-12 md:p-16">
              <div className="grid md:grid-cols-3 gap-12 items-center">
                <div className="md:col-span-1">
                  <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                      alt="Phil E.A"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h3 className="text-3xl font-bold text-gray-900 mb-4">About the Author</h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {product.author_bio}
                  </p>
                  <div className="space-y-3">
                    {[
                      'Founder of BuildersConnect',
                      'Host of Future Foundations Podcast (50+ episodes)',
                      'Real estate investor across multiple markets',
                      'International keynote speaker'
                    ].map((credential, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-700">{credential}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials Section */}
      {testimonialsSection && product.testimonials && product.testimonials.length > 0 && (
        <div className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What Readers Say
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {product.testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-md">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-accent" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic leading-relaxed">"{testimonial.quote}"</p>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Section */}
      {faqSection && product.faqs && product.faqs.length > 0 && (
        <div className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {product.faqs.map((faq, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ ambitious builders designing lives beyond default settings
          </p>
          
          <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-md mx-auto mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-6">
              <div className="text-5xl font-bold text-primary">${getDisplayPrice()}</div>
              {getOriginalPrice() && (
                <div className="text-2xl text-gray-400 line-through">${getOriginalPrice()}</div>
              )}
            </div>
            <Button size="lg" className="w-full mb-4 bg-primary hover:bg-primary/90">
              <ShoppingCart className="w-5 h-5 mr-2" />
              {hasActiveCampaign() ? 'Pre-Order Now' : 'Buy Now'}
            </Button>
            <p className="text-sm text-gray-500">
              {hasActiveCampaign() ? 'Limited time pre-order pricing' : '100% satisfaction guarantee'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Instant digital access</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
