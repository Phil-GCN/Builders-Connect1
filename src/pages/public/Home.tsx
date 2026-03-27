import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { ArrowRight, BookOpen, Mic, TrendingUp, Users, Target, Play } from 'lucide-react';
import { fetchPodcastEpisodes, PodcastEpisode } from '../../lib/podcast';

const Home: React.FC = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    const data = await fetchPodcastEpisodes();
    setEpisodes(data.slice(0, 3)); // Show 3 latest episodes
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section - Solid Color */}
      <div className="pt-32 pb-20 px-4 bg-primary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Build Beyond Borders
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              Join 10,000+ ambitious builders designing lives beyond default settings through strategic frameworks, community, and actionable content.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/shop">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 hover:text-primary font-semibold">
                  Explore Products
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary font-semibold">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Book Section */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">New Release</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built to Last
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The definitive guide to building sustainable wealth, freedom, and legacy. 16 chapters of strategic frameworks backed by real-world case studies.
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
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
                      Save $10
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-gray-700">16 comprehensive chapters across 4 parts</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Real-world case studies and frameworks</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Actionable exercises and templates</span>
                  </div>
                </div>

                <Link to="/shop/built-to-last">
                  <Button size="lg" className="w-full">
                    Pre-Order Now - $19
                  </Button>
                </Link>
              </div>

              <div className="bg-accent/10 border-2 border-accent/30 rounded-xl p-4">
                <p className="font-bold text-gray-900 mb-1">🎁 First 100 Pre-Orders Bonus</p>
                <p className="text-sm text-gray-600">Exclusive live Q&A session with Phil E.A + Digital companion workbook</p>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[3/4] bg-primary/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center p-12">
                  <div className="text-center">
                    <BookOpen className="w-32 h-32 text-primary mx-auto mb-6" />
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">Built to Last</h3>
                    <p className="text-gray-600">Launching February 2027</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-accent text-white px-8 py-4 rounded-full shadow-xl font-bold text-lg">
                Pre-Order Now
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Podcast Episodes */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-6">
              <Mic className="w-4 h-4 text-secondary" />
              <span className="text-sm font-semibold text-secondary">Future Foundations Podcast</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Latest Episodes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Strategic conversations with ambitious builders who have designed lives beyond default settings
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {episodes.map((episode) => (
              <div key={episode.id} className="group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {episode.coverImage ? (
                    <img 
                      src={episode.coverImage} 
                      alt={episode.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Mic className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-primary ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {episode.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                    {episode.description}
                  </p>
                  <div className="text-xs text-gray-500">
                    {new Date(episode.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/podcast">
              <Button size="lg" variant="outline">
                View All Episodes
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Value Pillars */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Four Pillars
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive framework for building wealth, freedom, and legacy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: TrendingUp,
                title: 'Mindset',
                description: 'Break free from default thinking and develop the strategic mindset required for building',
                color: 'primary'
              },
              {
                icon: BookOpen,
                title: 'Wealth',
                description: 'Learn proven frameworks for building sustainable wealth through multiple income streams',
                color: 'secondary'
              },
              {
                icon: Target,
                title: 'Freedom',
                description: 'Design life on your terms with time and location independence',
                color: 'accent'
              },
              {
                icon: Users,
                title: 'Legacy',
                description: 'Build something that lasts beyond your lifetime and impacts future generations',
                color: 'primary'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow">
                  <div className={`w-14 h-14 bg-${pillar.color}/10 rounded-xl flex items-center justify-center mb-6`}>
                    <Icon className={`w-7 h-7 text-${pillar.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 px-4 bg-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Building?
          </h2>
          <p className="text-xl mb-8 opacity-90 leading-relaxed">
            Join 10,000+ ambitious builders who have rejected default settings and are designing lives on their own terms
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-white text-secondary hover:bg-gray-100">
                Explore Products
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/community">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Stay Connected
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get weekly insights on building wealth, freedom, and legacy
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-lg focus:border-primary outline-none text-lg"
            />
            <Button size="lg" type="submit">
              Subscribe
            </Button>
          </form>
          <p className="text-sm text-gray-500 mt-4">
            Join 10,000+ builders. Unsubscribe anytime.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
