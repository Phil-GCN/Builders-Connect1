import { supabase } from './supabase';

// Fetch settings once and cache
let cachedSettings: any = null;

const getSettings = async () => {
  if (cachedSettings) return cachedSettings;

  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .eq('is_public', true);

  cachedSettings = {};
  data?.forEach(setting => {
    cachedSettings[setting.key] = setting.value;
  });

  return cachedSettings;
};

export const PODCAST_INFO = {
  get rss() { return cachedSettings?.podcast_rss_url || 'https://anchor.fm/s/10e9edcac/podcast/rss'; },
  get youtube() { return cachedSettings?.youtube_channel_url || 'https://www.youtube.com/@GlobalCitizenNetwork'; },
  get youtubePlaylist() { return cachedSettings?.youtube_playlist_url || 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270'; },
  get youtubePlaylistId() { return cachedSettings?.youtube_playlist_id || 'PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270'; },
  get spotify() { return cachedSettings?.spotify_show_url || 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9'; },
  get spotifyEmbed() { return cachedSettings?.spotify_embed_url || 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video'; },
  get applePodcast() { return cachedSettings?.apple_podcast_url || 'https://podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146'; },
  get appleEmbed() { return 'https://embed.podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146'; },
};

// Initialize settings on module load
getSettings();

// Rest of your existing podcast.ts code...

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  youtubeUrl?: string;
  spotifyUrl?: string;
  publishedAt: string;
  duration?: string;
  coverImage?: string;
  guid?: string;
  link?: string;
}

export const PODCAST_INFO = {
  rss: 'https://anchor.fm/s/10e9edcac/podcast/rss',
  youtube: 'https://www.youtube.com/@GlobalCitizenNetwork',
  youtubePlaylist: 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270&si=wTB9x4RHi1hQremv',
  youtubePlaylistId: 'PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270',
  spotify: 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9?si=37ba2ca4a859484e',
  spotifyEmbed: 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video',
  applePodcast: 'https://podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146',
  appleEmbed: 'https://embed.podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146',
};

const YOUTUBE_API_KEY = 'AIzaSyCP87YC9sr6lcdjyLn_GmTaGz2qTsPdpJ8';

// Fetch YouTube videos from playlist
const fetchYouTubeVideos = async (): Promise<Map<string, string>> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PODCAST_INFO.youtubePlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    );
    const data = await response.json();
    
    if (!data.items) return new Map();
    
    // Create map of video titles to video IDs
    const videoMap = new Map<string, string>();
    data.items.forEach((item: any) => {
      const title = item.snippet.title.toLowerCase();
      const videoId = item.snippet.resourceId.videoId;
      videoMap.set(title, `https://www.youtube.com/watch?v=${videoId}`);
    });
    
    return videoMap;
  } catch (error) {
    console.error('Error fetching YouTube videos:', error);
    return new Map();
  }
};

// Match episode titles to YouTube videos
const matchEpisodeToYouTube = (episodeTitle: string, videoMap: Map<string, string>): string | undefined => {
  const normalizedTitle = episodeTitle.toLowerCase();
  
  // Try exact match first
  if (videoMap.has(normalizedTitle)) {
    return videoMap.get(normalizedTitle);
  }
  
  // Try fuzzy matching - find video with most matching words
  let bestMatch: { url: string; score: number } | null = null;
  
  for (const [videoTitle, videoUrl] of videoMap.entries()) {
    const episodeWords = normalizedTitle.split(' ').filter(w => w.length > 3);
    const videoWords = videoTitle.split(' ').filter(w => w.length > 3);
    
    let matchScore = 0;
    episodeWords.forEach(word => {
      if (videoWords.some(vw => vw.includes(word) || word.includes(vw))) {
        matchScore++;
      }
    });
    
    if (matchScore > 0 && (!bestMatch || matchScore > bestMatch.score)) {
      bestMatch = { url: videoUrl, score: matchScore };
    }
  }
  
  return bestMatch?.url;
};

// Parse RSS feed and match with YouTube
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  try {
    // Fetch both RSS and YouTube data
    const [rssResponse, youtubeVideos] = await Promise.all([
      fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(PODCAST_INFO.rss)}`),
      fetchYouTubeVideos()
    ]);
    
    const rssData = await rssResponse.json();
    
    if (rssData.status !== 'ok') {
      throw new Error('Failed to fetch podcast feed');
    }

    return rssData.items.slice(0, 20).map((item: any, index: number) => {
      // Match episode to YouTube video
      const youtubeUrl = matchEpisodeToYouTube(item.title, youtubeVideos);
      
      return {
        id: item.guid || `episode-${index}`,
        title: item.title,
        description: item.description?.replace(/<[^>]*>/g, '') || '',
        audioUrl: item.enclosure?.link || '',
        youtubeUrl,
        publishedAt: item.pubDate,
        duration: item.itunes?.duration || '',
        coverImage: item.thumbnail || item.image || rssData.feed?.image || '',
        guid: item.guid,
        link: item.link,
      };
    });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return [];
  }
};

// No longer needed - using YouTube URLs directly
export const getSpotifyEpisodeEmbed = (episode: PodcastEpisode): string | null => {
  return null;
};
