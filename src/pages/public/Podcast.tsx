import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Mic, Youtube, Music, Play, ExternalLink } from 'lucide-react';
import { fetchPodcastEpisodes, PODCAST_INFO, PodcastEpisode } from '../../lib/podcast';

const Podcast: React.FC = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    setLoading(true);
    const data = await fetchPodcastEpisodes();
    setEpisodes(data);
    setLoading(false);
  };

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
            
            {/* Platform Links */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <a href={PODCAST_INFO.spotify} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Spotify
                </Button>
              </a>
              <a href={PODCAST_INFO.youtubePlaylist} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Youtube className="w-5 h-5" />
                  YouTube
                </Button>
              </a>
              <a href={PODCAST_INFO.applePodcast} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Apple Podcasts
                </Button>
              </a>
            </div>

            {/* Spotify Embed */}
            <div className="max-w-3xl mx-auto mb-12">
              <iframe
                style={{ borderRadius: '12px' }}
                src={PODCAST_INFO.spotifyEmbed}
                width="100%"
                height="351"
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="shadow-xl"
              ></iframe>
            </div>
          </div>

          {/* Episodes Section */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Latest Episodes</h2>
            
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading episodes...</p>
              </div>
            ) : episodes.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl">
                <Mic className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No episodes found. Check back soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {episodes.map((episode) => (
                  <div key={episode.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group">
                    {/* Episode Cover */}
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                      {episode.coverImage ? (
                        <img 
                          src={episode.coverImage} 
                          alt={episode.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Mic className="w-20 h-20 text-primary/30" />
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
                    
                    {/* Episode Info */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span>{new Date(episode.publishedAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                        {episode.duration && (
                          <>
                            <span>•</span>
                            <span>{episode.duration}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-3 line-clamp-2">{episode.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {episode.description}
                      </p>
                      {episode.audioUrl && (
                        <a 
                          href={episode.audioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                        >
                          Listen Now <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guest Submission CTA */}
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
