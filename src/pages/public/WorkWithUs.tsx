import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Mic, Users, Newspaper, Handshake, Mail, Send } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type RequestType = 'speaking' | 'podcast_guest' | 'podcast_invite' | 'press' | 'partnership' | 'general';

interface RequestTypeConfig {
  id: RequestType;
  label: string;
  icon: any;
  email: string;
  description: string;
  fields: string[];
}

const WorkWithUs: React.FC = () => {
  const [selectedType, setSelectedType] = useState<RequestType>('speaking');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
    podcast_name: '',
    audience_size: '',
    topic: '',
    event_name: '',
    event_date: '',
    event_location: '',
    audience_size_event: '',
    publication: '',
    deadline: '',
    partnership_type: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestTypes: RequestTypeConfig[] = [
    { 
      id: 'speaking',
      label: 'Speaking Engagement',
      icon: Mic,
      email: 'bookings@buildersconnect.org',
      description: 'Book Phil for keynotes, panels, workshops, or fireside chats at your event',
      fields: ['event_name', 'event_date', 'event_location', 'audience_size_event']
    },
    { 
      id: 'podcast_guest',
      label: 'Podcast Guest Application',
      icon: Users,
      email: 'bookings@buildersconnect.org',
      description: 'Apply to share your builder story and strategic insights on Future Foundations',
      fields: ['podcast_name', 'audience_size', 'topic']
    },
    { 
      id: 'podcast_invite',
      label: 'Podcast Interview Request',
      icon: Mic,
      email: 'bookings@buildersconnect.org',
      description: 'Invite Phil as a guest on your podcast, YouTube channel, or media platform',
      fields: ['podcast_name', 'audience_size', 'topic']
    },
    { 
      id: 'press',
      label: 'Press & Media',
      icon: Newspaper,
      email: 'press@buildersconnect.org',
      description: 'Media inquiries, interviews, quotes, or press releases',
      fields: ['publication', 'deadline']
    },
    { 
      id: 'partnership',
      label: 'Partnership Opportunity',
      icon: Handshake,
      email: 'partnerships@buildersconnect.org',
      description: 'Explore collaborations, joint ventures, or strategic partnerships',
      fields: ['partnership_type']
    },
    { 
      id: 'general',
      label: 'General Inquiry',
      icon: Mail,
      email: 'hello@buildersconnect.org',
      description: 'Questions, feedback, or anything else you would like to discuss',
      fields: []
    },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedConfig = requestTypes.find(t => t.id === selectedType)!;
      const additional_data: any = {};
      
      selectedConfig.fields.forEach(field => {
        if (formData[field as keyof typeof formData]) {
          additional_data[field] = formData[field as keyof typeof formData];
        }
      });

      const { error } = await supabase
        .from('contact_requests')
        .insert({
          request_type: selectedType,
          name: formData.name,
          email: formData.email,
          company: formData.company || null,
          message: formData.message,
          additional_data,
        });

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error('Error submitting form:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedTypeInfo = requestTypes.find(t => t.id === selectedType)!;
  const shouldShowField = (field: string) => selectedTypeInfo.fields.includes(field);

  const resetForm = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      email: '',
      company: '',
      message: '',
      podcast_name: '',
      audience_size: '',
      topic: '',
      event_name: '',
      event_date: '',
      event_location: '',
      audience_size_event: '',
      publication: '',
      deadline: '',
      partnership_type: '',
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Work With Us</h1>
            <p className="text-xl text-gray-600">
              Let's explore how we can collaborate
            </p>
          </div>

          {!submitted ? (
            <div className="grid md:grid-cols-3 gap-8">
              {/* Type Selection */}
              <div className="md:col-span-1">
                <h3 className="font-semibold text-lg mb-4">Select Request Type</h3>
                <div className="space-y-2">
                  {requestTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg transition-all ${
                          selectedType === type.id
                            ? 'bg-primary text-white shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="text-sm font-medium text-left">{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <selectedTypeInfo.icon className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTypeInfo.label}</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-8">
                    {selectedTypeInfo.description}
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Common Fields */}
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Your Name *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company/Organization
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="Your company"
                      />
                    </div>

                    {/* Podcast Guest/Invite Fields */}
                    {(shouldShowField('podcast_name') || shouldShowField('audience_size') || shouldShowField('topic')) && (
                      <>
                        <div className="grid md:grid-cols-2 gap-5">
                          {shouldShowField('podcast_name') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Podcast/Platform Name
                              </label>
                              <input
                                type="text"
                                value={formData.podcast_name}
                                onChange={(e) => setFormData({ ...formData, podcast_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="Your podcast"
                              />
                            </div>
                          )}

                          {shouldShowField('audience_size') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Audience Size
                              </label>
                              <input
                                type="text"
                                value={formData.audience_size}
                                onChange={(e) => setFormData({ ...formData, audience_size: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="e.g., 10K subscribers"
                              />
                            </div>
                          )}
                        </div>

                        {shouldShowField('topic') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Proposed Topic *
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.topic}
                              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              placeholder="What would you like to discuss?"
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* Speaking Engagement Fields */}
                    {(shouldShowField('event_name') || shouldShowField('event_date') || shouldShowField('event_location') || shouldShowField('audience_size_event')) && (
                      <>
                        <div className="grid md:grid-cols-2 gap-5">
                          {shouldShowField('event_name') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Name *
                              </label>
                              <input
                                type="text"
                                required
                                value={formData.event_name}
                                onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="Annual Conference 2025"
                              />
                            </div>
                          )}

                          {shouldShowField('event_date') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Date
                              </label>
                              <input
                                type="date"
                                value={formData.event_date}
                                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                          {shouldShowField('event_location') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Event Location
                              </label>
                              <input
                                type="text"
                                value={formData.event_location}
                                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="City, Country"
                              />
                            </div>
                          )}

                          {shouldShowField('audience_size_event') && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Expected Attendance
                              </label>
                              <input
                                type="text"
                                value={formData.audience_size_event}
                                onChange={(e) => setFormData({ ...formData, audience_size_event: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="e.g., 500 attendees"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* Press Fields */}
                    {(shouldShowField('publication') || shouldShowField('deadline')) && (
                      <div className="grid md:grid-cols-2 gap-5">
                        {shouldShowField('publication') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Publication/Outlet
                            </label>
                            <input
                              type="text"
                              value={formData.publication}
                              onChange={(e) => setFormData({ ...formData, publication: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                              placeholder="Your publication"
                            />
                          </div>
                        )}

                        {shouldShowField('deadline') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={formData.deadline}
                              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Partnership Fields */}
                    {shouldShowField('partnership_type') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Partnership Type
                        </label>
                        <select
                          value={formData.partnership_type}
                          onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          <option value="">Select type...</option>
                          <option value="affiliate">Affiliate Partnership</option>
                          <option value="content">Content Collaboration</option>
                          <option value="sponsorship">Sponsorship</option>
                          <option value="joint_venture">Joint Venture</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    )}

                    {/* Message Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {selectedType === 'podcast_guest' ? 'Tell Us About Your Story *' : 'Message *'}
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                        placeholder={
                          selectedType === 'podcast_guest'
                            ? 'Why would you be a great guest? What unique insights can you share?'
                            : 'Tell us about your request...'
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2"
                      size="lg"
                    >
                      {submitting ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center bg-green-50 rounded-2xl p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for reaching out. We will review your request and get back to you within 2-3 business days.
              </p>
              <Button onClick={resetForm}>
                Submit Another Request
              </Button>
            </div>
          )}
        </div>
        {/* Donate Section */}
          <div className="mt-20 bg-gradient-to-br from-accent/10 via-primary/10 to-secondary/10 rounded-2xl p-12">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Support Our Mission
              </h2>
              
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Help us empower ambitious builders worldwide to design lives beyond default settings. Your contribution funds free resources, community programs, and accessible content that transforms lives.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <p className="text-sm text-gray-600">Builders impacted</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl font-bold text-secondary mb-2">100%</div>
                  <p className="text-sm text-gray-600">Free resources</p>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <div className="text-3xl font-bold text-accent mb-2">50+</div>
                  <p className="text-sm text-gray-600">Episodes produced</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://donate.stripe.com/test_00000000000" target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    Make a Donation
                  </Button>
                </a>
                <Button variant="outline" size="lg" onClick={() => { /* TODO: Show more info */ }}>
                  Learn More About Our Impact
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                BuildersConnect is committed to transparency. All donations support content creation, community programs, and platform maintenance.
              </p>
            </div>
          </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkWithUs;
