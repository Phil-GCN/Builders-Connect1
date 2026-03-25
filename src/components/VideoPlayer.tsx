import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl?: string;
  audioUrl?: string;
  title: string;
  coverImage?: string;
  type: 'video' | 'audio';
  onClose: () => void;
}

export const PiPVideoPlayer: React.FC<VideoPlayerProps> = ({ 
  videoUrl, 
  audioUrl, 
  title, 
  coverImage,
  type,
  onClose 
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Extract video ID from YouTube URL
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1` : null;
  };

  // Extract Spotify embed URL
  const getSpotifyEmbedUrl = (url: string) => {
    const episodeId = url.match(/episode\/([a-zA-Z0-9]+)/)?.[1];
    return episodeId ? `https://open.spotify.com/embed/episode/${episodeId}?utm_source=generator` : null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.player-controls')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const embedUrl = type === 'video' && videoUrl 
    ? getYouTubeEmbedUrl(videoUrl) || getSpotifyEmbedUrl(videoUrl)
    : null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-2xl overflow-hidden"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: isMinimized ? '300px' : '480px',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between player-controls">
        <h4 className="text-sm font-medium truncate flex-1">{title}</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Player */}
      {!isMinimized && (
        <div className="aspect-video bg-black">
          {type === 'video' && embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : type === 'audio' && audioUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt={title}
                  className="w-32 h-32 rounded-lg shadow-lg mb-4"
                />
              )}
              <audio
                controls
                autoPlay
                className="w-full px-4"
                src={audioUrl}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <p>No media available</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Inline Audio Player (for "Listen" buttons)
export const InlineAudioPlayer: React.FC<{ 
  audioUrl: string; 
  title: string;
  coverImage?: string;
}> = ({ audioUrl, title, coverImage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40 player-controls">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {coverImage && (
            <img 
              src={coverImage} 
              alt={title}
              className="w-16 h-16 rounded-lg"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{title}</p>
            <audio
              controls
              autoPlay
              className="w-full mt-2"
              src={audioUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
