import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Volume2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
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
  const [position, setPosition] = useState({ x: window.innerWidth - 520, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

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
      x: Math.max(0, Math.min(window.innerWidth - 480, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 300, e.clientY - dragOffset.y))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

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
      <div className="bg-gray-900 text-white px-4 py-2 flex items-center justify-between player-controls cursor-default">
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
          {type === 'video' && videoUrl ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : type === 'audio' && audioUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-6">
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
                className="w-full"
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

// Inline Audio Player with Close Button
export const InlineAudioPlayer: React.FC<{ 
  audioUrl: string; 
  title: string;
  coverImage?: string;
  onClose: () => void;
}> = ({ audioUrl, title, coverImage, onClose }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4">
          {coverImage && (
            <img 
              src={coverImage} 
              alt={title}
              className="w-16 h-16 rounded-lg flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-gray-900 truncate">{title}</p>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 ml-4"
                title="Close player"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <audio
              controls
              autoPlay
              className="w-full"
              src={audioUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
