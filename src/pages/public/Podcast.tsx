import React from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Mic, Youtube, Music } from 'lucide-react';

const Podcast: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mic className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">Future Foundations</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Strategic conversations with ambitious builders who've designed lives beyond default settings
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Apple Podcasts
                </Button>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Spotify
                </Button>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Youtube className="w-5 h-5" />
                  YouTube
                </Button>
              </a>
            </div>
          </div>

          {/* Episodes Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20"></div>
                <div className="p-6">
                  <span className="text-primary font-semibold text-sm">Episode {i}</span>
                  <h3 className="font-bold text-xl mt-2 mb-3">Coming Soon</h3>
                  <p className="text-gray-600 text-sm">
                    Strategic insights on building wealth, freedom, and legacy beyond default settings
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Guest Submission */}
          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to be a guest?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're always looking for ambitious builders with compelling stories and strategic insights to share
            </p>
            <a href="/work-with-us">
              <Button size="lg">Submit Guest Application</Button>
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Podcast;
