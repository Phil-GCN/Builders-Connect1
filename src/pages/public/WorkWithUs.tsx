import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Mic, Users, Newspaper, Handshake, Mail } from 'lucide-react';

type RequestType = 'speaking' | 'podcast_guest' | 'podcast_invite' | 'press' | 'partnership' | 'general';

const WorkWithUs: React.FC = () => {
  const [selectedType, setSelectedType] = useState<RequestType>('speaking');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestTypes = [
    { id: 'speaking' as RequestType, label: 'Speaking Engagement', icon: Mic, email: 'speaking@buildersconnect.org' },
    { id: 'podcast_guest' as RequestType, label: 'Podcast Guest (You on Our Show)', icon: Users, email: 'podcast@buildersconnect.org' },
    { id: 'podcast_invite' as RequestType, label: 'Podcast Interview (Phil on Your Show)', icon: Mic, email: 'podcast@buildersconnect.org' },
    { id: 'press' as RequestType, label: 'Press & Media', icon: Newspaper, email: 'press@buildersconnect.org' },
    { id: 'partnership' as RequestType, label: 'Partnership Opportunity', icon: Handshake, email: 'partnerships@buildersconnect.org' },
    { id: 'general' as RequestType, label: 'General Inquiry', icon: Mail, email: 'hello@buildersconnect.org' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // TODO: Send to Supabase
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const selectedTypeInfo = requestTypes.find(t => t.id === selectedType);

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
                  <div className="flex items-center gap-3 mb-6">
                    {selectedTypeInfo && <selectedTypeInfo.icon className="w-6 h-6 text-primary" />}
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTypeInfo?.label}</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-6">
                    This request will be sent to: <span className="font-semibold text-primary">{selectedTypeInfo?.email}</span>
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        placeholder="Tell us about your request..."
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full"
                      size="lg"
                    >
                      {submitting ? 'Sending...' : 'Submit Request'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto text-center bg-green-50 rounded-2xl p-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
              <p className="text-lg text-gray-600 mb-8">
                Thank you for reaching out. We'll review your request and get back to you within 2-3 business days.
              </p>
              <Button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', company: '', message: '' }); }}>
                Submit Another Request
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default WorkWithUs;
