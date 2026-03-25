import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-8">About BuildersConnect</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              BuildersConnect is where ambitious people learn to design lives beyond default settings.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">The Story</h2>
            <p className="text-gray-700 mb-4">
              Founded by Phil, an immigrant who broke free from corporate default paths to build 
              a life of intentional design. Through personal experience navigating career pivots, 
              wealth building, and cross-cultural transitions, BuildersConnect emerged as a platform 
              to share strategic frameworks that work.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">What We Do</h2>
            <p className="text-gray-700 mb-4">
              We provide strategic frameworks, community, and tools for ambitious builders who refuse 
              to settle for default life paths. Through the Future Foundations podcast, books, and 
              community discussions, we help you design sustainable wealth, true freedom, and lasting legacy.
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-4">
              To empower 100,000 builders worldwide to break free from default settings and create 
              lives of intentional design, financial independence, and meaningful impact.
            </p>

            <div className="bg-gray-50 rounded-2xl p-8 mt-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Media & Press</h3>
              <p className="text-gray-700 mb-4">
                For speaking engagements, podcast interviews, or press inquiries, visit our{' '}
                <a href="/work-with-us" className="text-primary hover:underline">Work With Us</a> page.
              </p>
              <p className="text-gray-600">
                Press contact: <a href="mailto:press@buildersconnect.org" className="text-primary hover:underline">
                  press@buildersconnect.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
