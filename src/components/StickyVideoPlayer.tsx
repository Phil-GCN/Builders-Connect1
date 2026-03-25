import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';

interface StickyVideoPlayerProps {
  embedUrl: string;
  title: string;
  coverImage?: string;
}

export const StickyVideoPlayer: React.FC<StickyVideoPlayerProps> = ({ 
  embedUrl, 
  title, 
  coverImage 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showCover, setShowCover] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const isScrolledPast = rect.top < -rect.height / 2;
      const isScrolledBack = rect.top > -100;
      
      if (isScrolledPast && !isSticky) {
        setIsSticky(true);
      } else if (isScrolledBack && isSticky) {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSticky]);

  const handlePlay = () => {
    setShowCover(false);
    setIsPlaying(true);
  };

  return (
    <>
      {/* Original Position */}
      <div ref={containerRef} className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl relative">
        {showCover && coverImage ? (
          <>
            <img 
              src={coverImage} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={handlePlay}
              className="absolute inset-0 bg-black/50 hover:bg-black/40 transition-colors flex items-center justify-center group"
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-10 h-10 text-primary ml-2" />
              </div>
            </button>
          </>
        ) : (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Sticky Floating Player */}
      {isSticky && isPlaying && (
        <div className="fixed bottom-20 right-6 w-96 z-50 shadow-2xl rounded-xl overflow-hidden bg-black">
          <iframe
            src={embedUrl}
            className="w-full aspect-video"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <div className="bg-gray-900 text-white px-3 py-2 text-sm truncate">
            {title}
          </div>
        </div>
      )}
    </>
  );
};
