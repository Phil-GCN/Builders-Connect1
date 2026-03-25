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
}

export const PODCAST_INFO = {
  rss: 'https://anchor.fm/s/10e9edcac/podcast/rss',
  youtube: 'https://www.youtube.com/@GlobalCitizenNetwork',
  youtubePlaylist: 'https://youtube.com/playlist?list=PL9fKbOngNj6Ac9wdzaJjxbDua3ZVe4270&si=wTB9x4RHi1hQremv',
  spotify: 'https://open.spotify.com/show/6yUjD35JA5VRfHzHw2gCX9?si=37ba2ca4a859484e',
  spotifyEmbed: 'https://open.spotify.com/embed/show/6yUjD35JA5VRfHzHw2gCX9/video',
  applePodcast: 'https://podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146',
  appleEmbed: 'https://embed.podcasts.apple.com/us/podcast/future-foundations-building-beyond-borders/id1874863146',
};

// Parse RSS feed
export const fetchPodcastEpisodes = async (): Promise<PodcastEpisode[]> => {
  try {
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(PODCAST_INFO.rss)}`
    );
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error('Failed to fetch podcast feed');
    }

    return data.items.slice(0, 20).map((item: any, index: number) => {
      // Extract Spotify episode ID from GUID
      const guid = item.guid || '';
      const spotifyMatch = guid.match(/episode\/([a-zA-Z0-9]{22})/);
      const spotifyEpisodeId = spotifyMatch ? spotifyMatch[1] : null;
      
      return {
        id: item.guid || `episode-${index}`,
        title: item.title,
        description: item.description?.replace(/<[^>]*>/g, '') || '',
        audioUrl: item.enclosure?.link || '',
        spotifyUrl: spotifyEpisodeId ? `https://open.spotify.com/episode/${spotifyEpisodeId}` : null,
        publishedAt: item.pubDate,
        duration: item.itunes?.duration || '',
        coverImage: item.thumbnail || data.feed?.image || '',
        guid: item.guid,
      };
    });
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return [];
  }
};

// Helper to get Spotify episode embed URL
export const getSpotifyEpisodeEmbed = (episode: PodcastEpisode): string | null => {
  if (!episode.guid) return null;
  const match = episode.guid.match(/episode\/([a-zA-Z0-9]{22})/);
  if (!match) return null;
  return `https://open.spotify.com/embed/episode/${match[1]}/video?utm_source=generator`;
};
