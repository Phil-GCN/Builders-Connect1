import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { BookOpen, FileText, Link as LinkIcon } from 'lucide-react';

const Resources: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Resources</h1>
            <p className="text-xl text-gray-600">
              Tools, frameworks, and insights for intentional builders
            </p>
          </div>

          {/* Blog Posts */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <BookOpen className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2">Article Title {i}</h3>
                    <p className="text-gray-600 mb-4">
                      Strategic insights on designing life beyond default settings...
                    </p>
                    <span className="text-primary font-semibold text-sm">Read More →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="w-8 h-8 text-secondary" />
              <h2 className="text-3xl font-bold text-gray-900">Free Tools</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-8">
                <h3 className="font-bold text-2xl mb-3">Life Design Assessment</h3>
                <p className="text-gray-600 mb-6">
                  Evaluate your current path and identify areas for intentional design
                </p>
                <button className="text-primary font-semibold">Take Assessment →</button>
              </div>
              <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-xl p-8">
                <h3 className="font-bold text-2xl mb-3">Decision Framework</h3>
                <p className="text-gray-600 mb-6">
                  Strategic tool for making complex life and career decisions
                </p>
                <button className="text-secondary font-semibold">Download Template →</button>
              </div>
            </div>
          </div>

          {/* Recommended Services */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <LinkIcon className="w-8 h-8 text-accent" />
              <h2 className="text-3xl font-bold text-gray-900">Recommended Services</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {['Wise', 'SafetyWing', 'Amazon Books'].map((name) => (
                <div key={name} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="font-bold text-lg mb-2">{name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Trusted service for builders
                  </p>
                  <a href="#" className="text-primary font-semibold text-sm">Learn More →</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
