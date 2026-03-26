import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Mic, BookOpen, TrendingUp, Building2, CheckCircle, Youtube, Linkedin, Twitter } from 'lucide-react';

type TabType = 'speaker' | 'thought-leader' | 'author' | 'investor';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('speaker');

  const tabs = [
    { id: 'speaker' as TabType, label: 'Keynote Speaker', icon: Mic },
    { id: 'thought-leader' as TabType, label: 'Thought Leader', icon: TrendingUp },
    { id: 'author' as TabType, label: 'Author & Creator', icon: BookOpen },
    { id: 'investor' as TabType, label: 'Real Estate Investor', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            About Phil E.A
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Founder of BuildersConnect. Helping ambitious people design lives beyond default settings.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            <a href="https://youtube.com/@GlobalCitizenNetwork" target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-md">
              <Youtube className="w-6 h-6 text-red-600" />
            </a>
            <a href="https://linkedin.com/in/yourprofile" target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-md">
              <Linkedin className="w-6 h-6 text-blue-600" />
            </a>
            <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors shadow-md">
              <Twitter className="w-6 h-6 text-blue-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 sticky top-16 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Keynote Speaker */}
          {activeTab === 'speaker' && (
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Keynote Speaker</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Phil delivers compelling keynotes on entrepreneurship, wealth building, and designing intentional lives. His talks blend strategic frameworks with real-world experience, inspiring audiences to break free from default settings.
                </p>
                
                <div className="space-y-4 mb-8">
                  {[
                    'Future of Work & Entrepreneurship',
                    'Wealth Building for Ambitious Builders',
                    'Designing Life Beyond Default Settings',
                    'Real Estate & Alternative Investments',
                    'Cross-Cultural Leadership & Global Mindset'
                  ].map((topic, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <span className="text-gray-700">{topic}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Speaking Engagements</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li>• Corporate events & conferences</li>
                    <li>• Universities & educational institutions</li>
                    <li>• Industry summits & workshops</li>
                    <li>• Virtual & hybrid events</li>
                  </ul>
                </div>

                <a href="/work-with-us" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                  Book Phil to Speak
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>

              <div className="space-y-6">
                <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop" 
                    alt="Speaking engagement"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1560439514-4e9645039924?w=400&h=300&fit=crop" 
                      alt="Conference"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=300&fit=crop" 
                      alt="Workshop"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thought Leader */}
          {activeTab === 'thought-leader' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Thought Leader</h2>
              <p className="text-xl text-gray-600 mb-12 text-center leading-relaxed">
                Through the Future Foundations podcast and strategic content, Phil shares frameworks for building wealth, freedom, and legacy.
              </p>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Mic className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Future Foundations Podcast</h3>
                  <p className="text-gray-600 mb-4">
                    Strategic conversations with ambitious builders who have designed lives beyond default settings. Over 50 episodes exploring wealth, mindset, and intentional living.
                  </p>
                  <a href="/podcast" className="text-primary font-semibold hover:underline">
                    Listen to the Podcast →
                  </a>
                </div>

                <div className="bg-gray-50 rounded-xl p-8">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Content</h3>
                  <p className="text-gray-600 mb-4">
                    Essays, frameworks, and resources on entrepreneurship, wealth building, and life design. Trusted by 10,000+ ambitious builders worldwide.
                  </p>
                  <a href="/resources" className="text-secondary font-semibold hover:underline">
                    Explore Resources →
                  </a>
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Core Philosophy</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Most people accept default settings - in their careers, finances, and life choices. Phil's work challenges this autopilot existence, providing frameworks for intentional design across four pillars: Mindset, Wealth, Freedom, and Legacy.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Drawing from cross-continental experience and real-world entrepreneurship, he translates complex strategies into actionable frameworks that ambitious builders can implement immediately.
                </p>
              </div>
            </div>
          )}

          {/* Author & Creator */}
          {activeTab === 'author' && (
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">Author & Creator</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Phil creates content that transforms how ambitious people think about wealth, freedom, and legacy. From books to podcasts to strategic essays, his work provides frameworks that actually work.
                </p>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 mb-8">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-20 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Built to Last</h3>
                      <p className="text-sm text-gray-600 mb-3">Launching February 2027</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-3 py-1 bg-primary text-white rounded-full font-semibold">Pre-Order: $19</span>
                        <span className="text-gray-500">Regular: $29</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-6">
                    The definitive guide to building wealth, freedom, and legacy. 16 chapters of strategic frameworks backed by real-world case studies and actionable exercises.
                  </p>
                  <a href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                    Pre-Order Now
                  </a>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">What Readers Say</h4>
                    <div className="space-y-4">
                      <blockquote className="border-l-4 border-primary pl-4 italic text-gray-600">
                        "Phil's frameworks changed how I think about building wealth. Practical, actionable, transformative."
                      </blockquote>
                      <blockquote className="border-l-4 border-secondary pl-4 italic text-gray-600">
                        "Finally, someone who gets it. Not theory - real strategies from someone who's done it."
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-gray-50 rounded-xl p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Content Portfolio</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">50+ Podcast Episodes</p>
                        <p className="text-sm text-gray-600">Deep-dive conversations with top builders</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Strategic Essays</p>
                        <p className="text-sm text-gray-600">Frameworks on wealth, mindset, and freedom</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Free Resources</p>
                        <p className="text-sm text-gray-600">Templates, guides, and actionable tools</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-semibold text-gray-900">Community Access</p>
                        <p className="text-sm text-gray-600">Connect with 10,000+ ambitious builders</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=600&fit=crop" 
                    alt="Writing and creating"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Real Estate Investor */}
          {activeTab === 'investor' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">Real Estate Investor</h2>
              <p className="text-xl text-gray-600 mb-12 text-center leading-relaxed">
                Building wealth through strategic real estate investments across multiple markets.
              </p>

              <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">Multi-Market</div>
                  <p className="text-gray-600">Portfolio</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-secondary mb-2">Long-Term</div>
                  <p className="text-gray-600">Value Focus</p>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-accent mb-2">Strategic</div>
                  <p className="text-gray-600">Positioning</p>
                </div>
              </div>

              <div className="prose prose-lg max-w-none mb-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Investment Philosophy</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Real estate is one of the most reliable wealth-building tools when approached strategically. Phil's investment approach focuses on long-term value creation, cash flow optimization, and strategic market positioning.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Rather than chasing short-term gains, he builds sustainable portfolios that generate passive income while appreciating in value - providing both immediate cash flow and long-term wealth accumulation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Focus Areas</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Residential Real Estate</h4>
                    <p className="text-gray-600 text-sm">Single-family and multi-family properties in high-growth markets</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Commercial Properties</h4>
                    <p className="text-gray-600 text-sm">Strategic commercial investments with strong fundamentals</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Value-Add Opportunities</h4>
                    <p className="text-gray-600 text-sm">Properties with improvement potential and forced appreciation</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Alternative Investments</h4>
                    <p className="text-gray-600 text-sm">REITs, syndications, and emerging market opportunities</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
