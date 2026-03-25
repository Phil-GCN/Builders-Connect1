import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Sparkles } from 'lucide-react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Design Your Life<br />
            <span className="text-primary">Beyond Default Settings</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Build the wealth, freedom, and legacy you deserve.<br />
            Strategic frameworks for ambitious people who refuse to settle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="flex items-center gap-2">
                Get the Book <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/community">
              <Button variant="outline" size="lg">
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Book */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-accent font-semibold text-sm uppercase tracking-wide">Pre-Order Now</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-6">Built to Last</h2>
              <p className="text-lg text-gray-600 mb-6">
                The modern guide to wealth, freedom, and legacy. Learn the frameworks that ambitious builders use to create sustainable success on their own terms.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-gray-700">16 chapters of strategic frameworks</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-gray-700">Real-world case studies from builders worldwide</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-gray-700">Actionable exercises and templates</span>
                </li>
              </ul>
              <Link to="/shop">
                <Button size="lg">Pre-Order for $19 (Save $10)</Button>
              </Link>
              <p className="text-sm text-gray-500 mt-3">Launch: February 2027 • First 100 buyers get exclusive Q&A</p>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] bg-gradient-to-br from-primary to-secondary rounded-2xl shadow-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Podcast Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Future Foundations Podcast</h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Strategic conversations with builders who've designed lives beyond default settings
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-2">Episode {i}: Coming Soon</h3>
                  <p className="text-gray-600 text-sm">Strategic insights on building wealth and freedom</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/podcast">
              <Button variant="outline" size="lg">View All Episodes</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">What We Stand For</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Strategic Thinking</h3>
              <p className="text-gray-600">
                Frameworks over motivation. Systems over hustle. Long-term thinking over quick fixes.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-gray-600">
                Connect with ambitious builders who understand the journey and share the vision.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Intentional Living</h3>
              <p className="text-gray-600">
                Design your life deliberately. Break free from default paths. Build what matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 px-4 bg-primary text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Join the Movement</h2>
          <p className="text-xl mb-8 text-primary-100">
            Get strategic insights, frameworks, and stories from ambitious builders worldwide
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <Button variant="secondary" size="lg">Subscribe</Button>
          </form>
          <p className="text-sm text-primary-100 mt-4">Join 10,000+ builders. Unsubscribe anytime.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
