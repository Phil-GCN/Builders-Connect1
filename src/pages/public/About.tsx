import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Mic, BookOpen, TrendingUp, Building2, CheckCircle, Users, Target, Compass, X, Send } from 'lucide-react';
import { Button } from '../../components/Button';
import { supabase } from '../../lib/supabase';

type TabType = 'speaker' | 'thought-leader' | 'author' | 'investor';
type FormType = 'speaking' | 'podcast' | null;

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('speaker');
  const [showForm, setShowForm] = useState<FormType>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    event_name: '',
    event_date: '',
    event_location: '',
    audience_size: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tabs = [
    { id: 'speaker' as TabType, label: 'Keynote Speaker', icon: Mic },
    { id: 'thought-leader' as TabType, label: 'Thought Leader', icon: TrendingUp },
    { id: 'author' as TabType, label: 'Author & Creator', icon: BookOpen },
    { id: 'investor' as TabType, label: 'Real Estate Investor', icon: Building2 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('contact_requests')
        .insert({
          request_type: showForm === 'speaking' ? 'speaking' : 'podcast_guest',
          name: formData.name,
          email: formData.email,
          company: formData.company || null,
          message: formData.message,
          additional_data: {
            event_name: formData.event_name,
            event_date: formData.event_date,
            event_location: formData.event_location,
            audience_size: formData.audience_size,
          },
        });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(() => {
        setShowForm(null);
        setSubmitted(false);
        setFormData({
          name: '',
          email: '',
          company: '',
          event_name: '',
          event_date: '',
          event_location: '',
          audience_size: '',
          message: '',
        });
      }, 2000);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              About BuildersConnect
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We empower ambitious builders worldwide to design lives beyond default settings through strategic frameworks, community, and actionable content.
            </p>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To equip ambitious individuals with frameworks and community to build wealth, freedom, and legacy on their own terms.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Compass className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed">
                A world where ambitious people reject default paths and deliberately design lives aligned with their values and aspirations.
              </p>
            </div>

            <div className="text-center p-8 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Our Values</h3>
              <p className="text-gray-600 leading-relaxed">
                Strategic thinking, intentional living, community support, and relentless pursuit of excellence in building meaningful lives.
              </p>
            </div>
          </div>

          {/* What We Do */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mic className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Strategic Content</h3>
                  <p className="text-gray-600 leading-relaxed">
                    The Future Foundations podcast, essays, and resources provide frameworks for wealth building, mindset mastery, and intentional living.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Educational Products</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Books, courses, and tools that translate complex strategies into actionable frameworks you can implement immediately.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Connect with 10,000+ ambitious builders who share your commitment to designing lives beyond default settings.
                  </p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Speaking & Events</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Keynotes, workshops, and events that inspire action and provide practical frameworks for transformation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-8 mb-20 text-center">
            <div>
              <div className="text-5xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600">Builders Worldwide</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">50+</div>
              <div className="text-gray-600">Podcast Episodes</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-accent mb-2">100%</div>
              <div className="text-gray-600">Free Resources</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-primary mb-2">4</div>
              <div className="text-gray-600">Core Pillars</div>
            </div>
          </div>
        </div>
      </div>

      {/* Founder Section with Tabs */}
      <div className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet the Founder</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Phil E.A leads BuildersConnect across multiple domains, bringing diverse expertise to serve ambitious builders worldwide.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-300 mb-12">
            <div className="flex overflow-x-auto justify-center">
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

          {/* Tab Content */}
          <div>
            {/* Keynote Speaker */}
            {activeTab === 'speaker' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Keynote Speaker</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Phil delivers compelling keynotes on entrepreneurship, wealth building, and designing intentional lives. His talks blend strategic frameworks with real-world experience.
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {[
                        'Future of Work & Entrepreneurship',
                        'Wealth Building Strategies',
                        'Life Design Beyond Default Settings',
                        'Real Estate & Alternative Investments',
                        'Cross-Cultural Leadership'
                      ].map((topic, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <span className="text-gray-700">{topic}</span>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => setShowForm('speaking')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                    >
                      Book Phil to Speak →
                    </button>
                  </div>

                  <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=600&fit=crop" 
                      alt="Speaking"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Thought Leader */}
            {activeTab === 'thought-leader' && (
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Thought Leader</h3>
                <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                  Through the Future Foundations podcast and strategic content, Phil shares frameworks for building wealth, freedom, and legacy with 10,000+ builders worldwide.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl p-8 text-left">
                    <Mic className="w-10 h-10 text-primary mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Future Foundations Podcast</h4>
                    <p className="text-gray-600 mb-4">
                      50+ episodes of strategic conversations with ambitious builders who have designed lives beyond default settings.
                    </p>
                    <a href="/podcast" className="text-primary font-semibold hover:underline">Listen Now →</a>
                  </div>

                  <div className="bg-white rounded-xl p-8 text-left">
                    <BookOpen className="w-10 h-10 text-secondary mb-4" />
                    <h4 className="text-xl font-bold text-gray-900 mb-3">Strategic Essays</h4>
                    <p className="text-gray-600 mb-4">
                      Frameworks and insights on entrepreneurship, wealth building, and intentional living.
                    </p>
                    <a href="/resources" className="text-secondary font-semibold hover:underline">Explore Resources →</a>
                  </div>
                </div>
              </div>
            )}

            {/* Author & Creator */}
            {activeTab === 'author' && (
              <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="aspect-square bg-primary/10 rounded-2xl flex items-center justify-center">
                    <div className="text-center p-8">
                      <BookOpen className="w-20 h-20 text-primary mx-auto mb-4" />
                      <h4 className="text-3xl font-bold text-gray-900 mb-2">Built to Last</h4>
                      <p className="text-gray-600 mb-4">Launching February 2027</p>
                      <div className="text-4xl font-bold text-primary">$19</div>
                      <p className="text-sm text-gray-500">Pre-order special</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-6">Author & Creator</h3>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      Phil creates content that transforms how ambitious people think about wealth, freedom, and legacy. His work provides frameworks that actually work.
                    </p>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-700">16-chapter guide to building wealth and legacy</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Real-world case studies and actionable exercises</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <span className="text-gray-700">Digital + physical formats available</span>
                      </div>
                    </div>

                    <a href="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
                      Pre-Order Now →
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Real Estate Investor */}
            {activeTab === 'investor' && (
              <div className="max-w-4xl mx-auto text-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">Real Estate Investor</h3>
                <p className="text-lg text-gray-600 mb-12 leading-relaxed">
                  Building wealth through strategic real estate investments with a focus on long-term value creation and cash flow optimization.
                </p>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                  <div>
                    <div className="text-4xl font-bold text-primary mb-2">Multi-Market</div>
                    <p className="text-gray-600">Portfolio Diversification</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-secondary mb-2">Long-Term</div>
                    <p className="text-gray-600">Value Focus</p>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-accent mb-2">Strategic</div>
                    <p className="text-gray-600">Market Positioning</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-8 text-left">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Investment Focus Areas</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Residential Real Estate</p>
                      <p className="text-gray-600 text-sm">Single-family and multi-family properties in high-growth markets</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Commercial Properties</p>
                      <p className="text-gray-600 text-sm">Strategic commercial investments with strong fundamentals</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Value-Add Opportunities</p>
                      <p className="text-gray-600 text-sm">Properties with improvement potential</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Alternative Investments</p>
                      <p className="text-gray-600 text-sm">REITs, syndications, and emerging markets</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Speaking Request Form Popup */}
      {showForm === 'speaking' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Speaking Engagement Request</h2>
                  <p className="text-sm text-gray-600">Book Phil for your event</p>
                </div>
              </div>
              <button onClick={() => setShowForm(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-6">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company/Organization</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      placeholder="Your company"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.event_name}
                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="Annual Conference 2025"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
                      <input
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Event Location</label>
                      <input
                        type="text"
                        value={formData.event_location}
                        onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expected Attendance</label>
                      <input
                        type="text"
                        value={formData.audience_size}
                        onChange={(e) => setFormData({ ...formData, audience_size: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="e.g., 500 attendees"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                      placeholder="Tell us about your event and speaking requirements..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={submitting} className="flex-1 flex items-center justify-center gap-2" size="lg">
                      {submitting ? 'Sending...' : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Request
                        </>
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(null)} size="lg">
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h3>
                  <p className="text-gray-600">
                    Thank you for your interest. We will review your request and get back to you soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default About;
