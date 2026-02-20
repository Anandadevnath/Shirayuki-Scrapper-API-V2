import axios from 'axios';

async function getStreamingServer({ animeEpisodeId, ep, server = 'hd-2', category = 'sub' }) {
  if (!animeEpisodeId || (ep === undefined || ep === null)) {
    console.error('[getStreamingServer] Missing parameters:', { animeEpisodeId, ep, server, category });
    return {
      status: 400,
      message: 'Missing required parameters: animeEpisodeId and ep',
    };
  }

  const baseUrl = 'https://nothing-2-zeta.vercel.app';
  const episodeIdParam = encodeURIComponent(`${animeEpisodeId}?ep=${ep}`);
  const serverName = encodeURIComponent(server);
  const categoryName = encodeURIComponent(category);

  const apiUrl = `${baseUrl}/api/v2/hianime/episode/sources?animeEpisodeId=${episodeIdParam}&server=${serverName}&category=${categoryName}`;
  console.log('[getStreamingServer] Params:', { animeEpisodeId, ep, server, category });
  console.log('[getStreamingServer] Built URL:', apiUrl);

  try {
    const { data } = await axios.get(apiUrl, { timeout: 10000 });
    return data;
  } catch (error) {
    console.error('[getStreamingServer] Error fetching:', error.message);
    return {
      status: 500,
      message: 'Failed to fetch streaming server data',
      error: error.message,
    };
  }
}

export { getStreamingServer };