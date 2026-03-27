import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { ShoppingCart, BookOpen, CheckCircle, Clock, Star, Shield, Download, Gift, Users, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  features?: string[];
  is_active: boolean;
  metadata?: any;
}

const Shop: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const builtToLast = products.find(p => p.name.includes('Built to Last'));

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Built to Last */}
      <div className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Product Image */}
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-12">
                    <BookOpen className="w-32 h-32 text-primary mx-auto mb-6" />
                    <h3 className="text-4xl font-bold text-gray-900">Built to Last</h3>
                    <p className="text-gray-600 mt-4">Your blueprint for wealth, freedom, and legacy</p>
                  </div>
                </div>
              </div>
              
              {/* Pre-order Badge */}
              <div className="absolute -top-4 -right-4 bg-accent text-white px-6 py-3 rounded-full shadow-lg font-bold text-lg">
                Pre-Order Now
              </div>
            </div>

            {/* Right - Product Info */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Launching February 2027</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Built to Last
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The definitive guide to building sustainable wealth, freedom, and legacy. 16 chapters of strategic frameworks backed by real-world case studies and actionable exercises.
              </p>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                <div className="flex items-baseline gap-4 mb-6">
                  <div>
                    <div className="text-5xl font-bold text-primary">$19</div>
                    <div className="text-sm text-gray-500">Pre-order price</div>
                  </div>
                  <div className="text-gray-400">
                    <div className="text-2xl line-through">$29</div>
                    <div className="text-sm">Launch price</div>
                  </div>
                  <div className="ml-auto">
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                      Save $10
                    </div>
                  </div>
                </div>

                {/* Bonus */}
                <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Gift className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-bold text-gray-900 mb-1">First 100 Pre-Orders Bonus</p>
                      <p className="text-sm text-gray-600">Exclusive live Q&A session with Phil E.A + Digital companion workbook</p>
                    </div>
                  </div>
                </div>

                <Button size="lg" className="w-full mb-4 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Pre-Order Now - $19
                </Button>
                
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

      {/* What's Inside */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What's Inside
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four comprehensive sections covering everything you need to build lasting wealth and freedom
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                title: 'Part 1: Mindset',
                icon: TrendingUp,
                chapters: '4 Chapters',
                description: 'Break free from default thinking and develop the builder\'s mindset',
                color: 'primary'
              },
              {
                title: 'Part 2: Wealth',
                icon: ShoppingCart,
                chapters: '4 Chapters',
                description: 'Strategic frameworks for building sustainable wealth streams',
                color: 'secondary'
              },
              {
                title: 'Part 3: Freedom',
                icon: Users,
                chapters: '4 Chapters',
                description: 'Design life on your terms with time and location freedom',
                color: 'accent'
              },
              {
                title: 'Part 4: Legacy',
                icon: Star,
                chapters: '4 Chapters',
                description: 'Build something that lasts beyond your lifetime',
                color: 'primary'
              }
            ].map((section, idx) => {
              const Icon = section.icon;
              return (
                <div key={idx} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 bg-${section.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${section.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{section.chapters}</p>
                  <p className="text-gray-600">{section.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Key Features */}
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
            {[
              'Real-world case studies from successful builders',
              'Step-by-step implementation frameworks',
              'Actionable exercises at the end of each chapter',
              'Financial modeling templates and calculators',
              'Resource library with tools and guides',
              'Lifetime access to digital edition',
              'Regular updates with new frameworks',
              'Private community access for readers',
              'Downloadable worksheets and checklists'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-xl p-6">
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Author Credibility */}
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
                  Phil E.A is the founder of BuildersConnect and host of the Future Foundations podcast. He's helped 10,000+ ambitious builders design lives beyond default settings through strategic frameworks and actionable content.
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

      {/* Testimonials */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Early Readers Say
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                quote: "Phil's frameworks completely changed how I think about building wealth. This isn't theory - it's practical, actionable, and transformative.",
                author: "Sarah M.",
                role: "Entrepreneur"
              },
              {
                quote: "Finally, someone who gets it. Not fluffy motivation - real strategies from someone who's actually done it. Worth 10x the price.",
                author: "David K.",
                role: "Real Estate Investor"
              },
              {
                quote: "The section on freedom alone is worth the entire book. Phil shows you exactly how to design life on your terms.",
                author: "Jessica L.",
                role: "Digital Nomad"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-md">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
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

      {/* FAQ */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: "When will I receive the book?",
                a: "Built to Last launches in February 2027. Pre-order customers will receive their copy on launch day, along with exclusive bonuses."
              },
              {
                q: "What formats are available?",
                a: "The book will be available in digital (PDF, ePub) and physical hardcover formats. Pre-order customers get lifetime access to the digital edition immediately upon launch."
              },
              {
                q: "What if I'm not satisfied?",
                a: "We offer a 100% satisfaction guarantee. If you're not happy with the book within 30 days of launch, we'll refund your purchase - no questions asked."
              },
              {
                q: "Who is this book for?",
                a: "Built to Last is for ambitious builders who want to design lives beyond default settings. Whether you're an entrepreneur, investor, or professional looking to build wealth and freedom, this book provides the frameworks you need."
              },
              {
                q: "Will there be updates?",
                a: "Yes! Digital edition customers receive lifetime access to all future updates and new frameworks as they're developed."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-20 px-4 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Something That Lasts?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ ambitious builders designing lives beyond default settings
          </p>
          
          <div className="bg-white rounded-2xl p-8 text-gray-900 max-w-md mx-auto mb-8">
            <div className="flex items-baseline justify-center gap-4 mb-6">
              <div className="text-5xl font-bold text-primary">$19</div>
              <div className="text-2xl text-gray-400 line-through">$29</div>
            </div>
            <Button size="lg" className="w-full mb-4 bg-primary hover:bg-primary/90">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Pre-Order Now
            </Button>
            <p className="text-sm text-gray-500">Limited time pre-order pricing</p>
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

export default Shop;
