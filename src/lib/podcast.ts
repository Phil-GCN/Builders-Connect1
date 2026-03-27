import { supabase } from './supabase';

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

// Settings cache
let settingsCache: Record<string, string> = {};
let settingsLoaded = false;

// Load settings from database
const loadSettings = async () => {
  if (settingsLoaded) return settingsCache;

  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .in('category', ['content']);

    if (error) throw error;

    data?.forEach(setting => {
      settingsCache[setting.key] = setting.value || '';
    });

    settingsLoaded = true;
  } catch (err) {
    console.error('Error loading settings:', err);
    // Use fallback values
    settingsCache = {
      podcast_rss_url: 'https://anchor.fm/s/10e9edcac/podcast/rss',
      spotify_embed_url: 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video',
      spotify_show_url: 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9?si=37ba2ca4a859484e',
      apple_podcast_url: 'https://podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146',
      youtube_channel_url: 'https://www.youtube.com/@GlobalCitizenNetwork',
      youtube_playlist_url: 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270',
      youtube_playlist_id: 'PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270',
    };
  }

  return settingsCache;
};

// Helper to get setting value
const getSetting = (key: string, fallback: string = '') => {
  return settingsCache[key] || fallback;
};

export const PODCAST_INFO = {
  get rss() { return getSetting('podcast_rss_url', 'https://anchor.fm/s/10e9edcac/podcast/rss'); },
  get youtube() { return getSetting('youtube_channel_url', 'https://www.youtube.com/@GlobalCitizenNetwork'); },
  get youtubePlaylist() { return getSetting('youtube_playlist_url', 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270'); },
  get youtubePlaylistId() { return getSetting('youtube_playlist_id', 'PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270'); },
  get spotify() { return getSetting('spotify_show_url', 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9'); },
  get spotifyEmbed() { return getSetting('spotify_embed_url', 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video'); },
  get applePodcast() { return getSetting('apple_podcast_url', 'https://podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146'); },
  get appleEmbed() { return 'https://embed.podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146'; },
};

// Parse RSS feed
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  // Load settings first
  await loadSettings();

  try {
    const rssUrl = PODCAST_INFO.rss;
    const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('Failed to fetch podcast feed');
    }

    return data.items.slice(0, 20).map((item: any, index: number) => ({
      id: item.guid || `episode-${index}`,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '') || '',
      audioUrl: item.enclosure?.link || '',
      publishedAt: item.pubDate,
      duration: item.itunes?.duration || '',
      coverImage: item.thumbnail || item.image || data.feed?.image || '',
      guid: item.guid,
      link: item.link,
    }));
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return [];
  }
};

export const getSpotifyEpisodeEmbed = (episode: PodcastEpisode): string | null => {
  return null;
};
