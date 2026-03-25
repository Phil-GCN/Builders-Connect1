export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  youtubeUrl?: string;
  publishedAt: string;
  duration?: string;
  coverImage?: string;
}

export const PODCAST_INFO = {
  rss: 'https://anchor.fm/s/10e9edcac/podcast/rss',
  youtube: 'https://www.youtube.com/@GlobalCitizenNetwork',
  youtubePlaylist: 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270&si=wTB9x4RHi1hQremv',
  spotify: 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9?si=37ba2ca4a859484e',
  spotifyEmbed: 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video',
  applePodcast: 'https://podcasts.apple.com/podcast/id1234567890', // Update with actual URL
};

// Parse RSS feed (client-side using CORS proxy)
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  try {
    // Using RSS to JSON API (free, no auth needed)
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(PODCAST_INFO.rss)}`
    );
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('Failed to fetch podcast feed');
    }

    return data.items.slice(0, 12).map((item: any, index: number) => ({
      id: item.guid || `episode-${index}`,
      title: item.title,
      description: item.description?.replace(/<[^>]*>/g, '') || '', // Strip HTML
      audioUrl: item.enclosure?.link || '',
      publishedAt: item.pubDate,
      duration: item.itunes?.duration || '',
      coverImage: item.thumbnail || data.feed?.image || '',
    }));
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return [];
  }
};
