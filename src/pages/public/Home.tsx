import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Sparkles, Play, CheckCircle, Star } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { fetchPodcastEpisodes, PodcastEpisode } from '../../lib/podcast';

const Home: React.FC = () => {
  const [latestEpisodes, setLatestEpisodes] = useState<PodcastEpisode[]>([]);
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadLatestEpisodes();
  }, []);

  const loadLatestEpisodes = async () => {
    const episodes = await fetchPodcastEpisodes();
    setLatestEpisodes(episodes.slice(0, 3));
  };

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Integrate with ConvertKit
    alert('Newsletter signup coming soon!');
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - Enhanced */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md mb-8">
              <Star className="w-4 h-4 text-accent fill-accent" />
              <span className="text-sm font-semibold text-gray-700">For Ambitious Builders Worldwide</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Design Your Life<br />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Beyond Default Settings
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build the wealth, freedom, and legacy you deserve. Strategic frameworks for ambitious people who refuse to settle.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/shop">
                <Button size="lg" className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow">
                  <BookOpen className="w-5 h-5" />
                  Pre-Order Book ($19)
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/podcast">
                <Button variant="outline" size="lg" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Listen to Podcast
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span>Join 10,000+ builders</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Free resources included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Book Section - Enhanced */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Book Cover */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl rounded-3xl"></div>
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary via-secondary to-accent rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <BookOpen className="w-20 h-20 mx-auto mb-4 opacity-50" />
                    <p className="text-2xl font-bold">BUILT TO LAST</p>
                    <p className="text-sm opacity-75 mt-2">Book cover coming soon</p>
                  </div>
                </div>
              </div>
              {/* Pre-order Badge */}
              <div className="absolute -top-6 -right-6 bg-accent text-white px-6 py-3 rounded-full shadow-lg transform rotate-12">
                <p className="font-bold text-sm">PRE-ORDER NOW</p>
              </div>
            </div>

            {/* Right: Book Details */}
            <div>
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6">
                📚 Available February 2027
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Built to Last
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The modern guide to wealth, freedom, and legacy. Learn the frameworks that ambitious builders use to create sustainable success on their own terms.
              </p>

              {/* Features List */}
              <div className="space-y-4 mb-10">
                {[
                  '16 chapters of strategic frameworks',
                  'Real-world case studies from builders worldwide',
                  'Actionable exercises and templates',
                  'Digital + Physical formats available'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-gray-700 text-lg">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-4xl font-bold text-primary">$19</span>
                  <span className="text-2xl text-gray-400 line-through">$29</span>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Save $10
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">Pre-order special pricing</p>
                
                <Link to="/shop">
                  <Button size="lg" className="w-full mb-3">
                    Pre-Order Now
                  </Button>
                </Link>
                
                <div className="bg-accent/10 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">🎁 Bonus:</span> First 100 buyers get exclusive Q&A session with Phil
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                ⚡ Launch: February 2027 • 📦 Instant digital delivery • 💯 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Section - Enhanced */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-secondary/10 text-secondary px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🎙️ Future Foundations Podcast
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Strategic Conversations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Learn from builders who've designed lives beyond default settings
            </p>
          </div>

          {latestEpisodes.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {latestEpisodes.map((episode, idx) => (
                <div key={episode.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                    {episode.coverImage ? (
                      <img 
                        src={episode.coverImage} 
                        alt={episode.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    {episode.audioUrl && (
                      <a 
                        href={episode.audioUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary ml-1" />
                        </div>
                      </a>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="text-xs text-gray-500 mb-2">
                      {new Date(episode.publishedAt).toLocaleDateString()}
                    </div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{episode.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{episode.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading latest episodes...</p>
            </div>
          )}

          <div className="text-center">
            <Link to="/podcast">
              <Button variant="outline" size="lg" className="shadow-md hover:shadow-lg transition-shadow">
                View All Episodes
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Value Pillars - Enhanced */}
      <section className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What We Stand For
            </h2>
            <p className="text-xl text-gray-600">Built on principles that actually work</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: BookOpen,
                color: 'primary',
                title: 'Strategic Thinking',
                description: 'Frameworks over motivation. Systems over hustle. Long-term thinking over quick fixes.'
              },
              {
                icon: Users,
                color: 'secondary',
                title: 'Community',
                description: 'Connect with ambitious builders who understand the journey and share the vision.'
              },
              {
                icon: Sparkles,
                color: 'accent',
                title: 'Intentional Living',
                description: 'Design your life deliberately. Break free from default paths. Build what matters.'
              }
            ].map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="text-center group">
                  <div className={`w-20 h-20 bg-${pillar.color}/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-10 h-10 text-${pillar.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{pillar.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter CTA - Enhanced */}
      <section className="py-24 px-4 bg-gradient-to-br from-primary via-secondary to-accent text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Join the Movement</h2>
          <p className="text-xl mb-10 opacity-90">
            Get strategic insights, frameworks, and stories from ambitious builders worldwide
          </p>
          
          <form onSubmit={handleNewsletterSignup} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/30 text-lg"
              />
              <Button 
                type="submit"
                variant="secondary" 
                size="lg"
                className="shadow-lg hover:shadow-xl"
              >
                Subscribe
              </Button>
            </div>
          </form>
          
          <p className="text-sm mt-6 opacity-75">
            Join 10,000+ builders • Unsubscribe anytime • Zero spam, pure value
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
