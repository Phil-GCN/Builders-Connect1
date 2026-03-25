import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { Button } from '../../components/Button';
import { Mic, Youtube, Music, Play, ChevronLeft, ChevronRight, Star, TrendingUp, Clock, Volume2 } from 'lucide-react';
import { fetchPodcastEpisodes, PODCAST_INFO, PodcastEpisode } from '../../lib/podcast';
import { PiPVideoPlayer, InlineAudioPlayer } from '../../components/VideoPlayer';

const Podcast: React.FC = () => {
  const [episodes, setEpisodes] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestStartIndex, setLatestStartIndex] = useState(0);
  const [pipPlayer, setPipPlayer] = useState<{ episode: PodcastEpisode; type: 'video' | 'audio' } | null>(null);
  const [audioPlayer, setAudioPlayer] = useState<PodcastEpisode | null>(null);
  const latestPerView = 3;

  useEffect(() => {
    loadEpisodes();
  }, []);

  const loadEpisodes = async () => {
    setLoading(true);
    const data = await fetchPodcastEpisodes();
    setEpisodes(data);
    setLoading(false);
  };

  const scrollLatest = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setLatestStartIndex(Math.max(0, latestStartIndex - latestPerView));
    } else {
      setLatestStartIndex(Math.min(episodes.length - latestPerView, latestStartIndex + latestPerView));
    }
  };

  const playAudio = (episode: PodcastEpisode) => {
    setPipPlayer(null);
    setAudioPlayer(episode);
  };

  const playVideo = (episode: PodcastEpisode) => {
    setAudioPlayer(null);
    setPipPlayer({ episode, type: 'video' });
  };

  const featuredEpisode = episodes[0];
  const latestEpisodes = episodes.slice(1, 13);
  const topEpisodes = episodes.slice(0, 6);

  // Extract Spotify embed URL for featured episode
  const getFeaturedSpotifyEmbed = () => {
    if (!featuredEpisode?.audioUrl) return null;
    const episodeId = featuredEpisode.audioUrl.match(/episode\/([a-zA-Z0-9]+)/)?.[1];
    return episodeId ? `https://open.spotify.com/embed/episode/${episodeId}/video?utm_source=generator` : null;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
              <Mic className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Future Foundations Podcast</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Build Beyond Borders
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Strategic conversations with ambitious builders designing lives beyond default settings
            </p>
            
            {/* Platform Links */}
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={PODCAST_INFO.spotify} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                  <Music className="w-4 h-4" />
                  Spotify
                </button>
              </a>
              <a href={PODCAST_INFO.youtubePlaylist} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                  <Youtube className="w-4 h-4" />
                  YouTube
                </button>
              </a>
              <a href={PODCAST_INFO.applePodcast} target="_blank" rel="noopener noreferrer">
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors">
                  <Music className="w-4 h-4" />
                  Apple Podcasts
                </button>
              </a>
            </div>
          </div>

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
            <>
              {/* Featured Video Episode - Embedded Spotify Player */}
              {featuredEpisode && (
                <section className="mb-20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Latest Episode</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(featuredEpisode.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="grid lg:grid-cols-3 gap-8 bg-gray-50 rounded-2xl p-8">
                    {/* Embedded Video Player */}
                    <div className="lg:col-span-2">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        {getFeaturedSpotifyEmbed() ? (
                          <iframe
                            style={{ borderRadius: '12px' }}
                            src={getFeaturedSpotifyEmbed()!}
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            allowFullScreen
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                          />
                        ) : featuredEpisode.coverImage ? (
                          <img 
                            src={featuredEpisode.coverImage} 
                            alt={featuredEpisode.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-20 h-20 text-white/50" />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Episode Details */}
                    <div className="flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">
                        {featuredEpisode.title}
                      </h3>
                      <p className="text-gray-600 mb-6 line-clamp-4">
                        {featuredEpisode.description}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {featuredEpisode.audioUrl && (
                          <Button 
                            size="sm" 
                            onClick={() => playAudio(featuredEpisode)}
                            className="flex items-center gap-2"
                          >
                            <Volume2 className="w-4 h-4" />
                            Listen (Audio Only)
                          </Button>
                        )}
                        <a href={PODCAST_INFO.youtubePlaylist} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Youtube className="w-4 h-4" />
                            YouTube Playlist
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Latest Episodes Carousel */}
              {latestEpisodes.length > 0 && (
                <section className="mb-20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Latest Episodes</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => scrollLatest('left')}
                        disabled={latestStartIndex === 0}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => scrollLatest('right')}
                        disabled={latestStartIndex >= latestEpisodes.length - latestPerView}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {latestEpisodes.slice(latestStartIndex, latestStartIndex + latestPerView).map((episode) => (
                      <div key={episode.id} className="group cursor-pointer">
                        {/* Thumbnail - Click to play video in PiP */}
                        <div 
                          className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden mb-3 relative"
                          onClick={() => playVideo(episode)}
                        >
                          {episode.coverImage ? (
                            <img 
                              src={episode.coverImage} 
                              alt={episode.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Mic className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                              <Play className="w-6 h-6 text-primary ml-1" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Info */}
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(episode.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {episode.duration && ` • ${episode.duration}`}
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {episode.title}
                        </h3>
                        
                        {/* Listen button - Audio only */}
                        {episode.audioUrl && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              playAudio(episode);
                            }}
                            className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                          >
                            <Volume2 className="w-3 h-3" />
                            Listen
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Top Episodes - Audio only */}
              {topEpisodes.length > 0 && (
                <section className="mb-20">
                  <div className="flex items-center gap-3 mb-6">
                    <Star className="w-6 h-6 text-accent fill-accent" />
                    <h2 className="text-2xl font-bold text-gray-900">Top Episodes</h2>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {topEpisodes.map((episode, idx) => (
                      <div key={episode.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow group">
                        <div className="flex gap-4">
                          {/* Small Thumbnail - Click for video PiP */}
                          <div 
                            className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex-shrink-0 overflow-hidden relative cursor-pointer"
                            onClick={() => playVideo(episode)}
                          >
                            {episode.coverImage ? (
                              <img 
                                src={episode.coverImage} 
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Mic className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-primary">#{idx + 1}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(episode.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {episode.title}
                            </h4>
                            {episode.audioUrl && (
                              <button
                                onClick={() => playAudio(episode)}
                                className="text-xs text-primary font-medium flex items-center gap-1 hover:gap-2 transition-all"
                              >
                                <Volume2 className="w-3 h-3" />
                                Listen
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Trending - PiP video on click */}
              <section className="mb-20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-secondary" />
                  <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                </div>
                <div className="grid md:grid-cols-4 gap-4">
                  {episodes.slice(3, 7).map((episode) => (
                    <div 
                      key={episode.id} 
                      className="group cursor-pointer"
                      onClick={() => playVideo(episode)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-2 relative">
                        {episode.coverImage ? (
                          <img 
                            src={episode.coverImage} 
                            alt={episode.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mic className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-primary ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {episode.title}
                      </h4>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Guest CTA */}
          <section className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-12 text-center">
            <Mic className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Want to Share Your Story?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're looking for ambitious builders with compelling insights to share with our community
            </p>
            <a href="mailto:bookings@buildersconnect.org">
              <Button size="lg">Submit Guest Application</Button>
            </a>
          </section>
        </div>
      </div>

      {/* Picture-in-Picture Video Player */}
      {pipPlayer && (
        <PiPVideoPlayer
          videoUrl={pipPlayer.episode.audioUrl}
          audioUrl={pipPlayer.episode.audioUrl}
          title={pipPlayer.episode.title}
          coverImage={pipPlayer.episode.coverImage}
          type={pipPlayer.type}
          onClose={() => setPipPlayer(null)}
        />
      )}

      {/* Inline Audio Player */}
      {audioPlayer && (
        <InlineAudioPlayer
          audioUrl={audioPlayer.audioUrl}
          title={audioPlayer.title}
          coverImage={audioPlayer.coverImage}
        />
      )}

      <Footer />
    </div>
  );
};

export default Podcast;
