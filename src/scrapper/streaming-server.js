import axios from 'axios';

async function getStreamingServer({ animeEpisodeId, ep, server = 'hd-2', category = 'sub' }) {
  if (!animeEpisodeId || (ep === undefined || ep === null)) {
    console.error('[getStreamingServer] Missing parameters:', { animeEpisodeId, ep, server, category });
    return {
      status: 400,
      message: 'Missing required parameters: animeEpisodeId and ep',
    };
  }

  const baseUrl = 'https://hianimez-red.vercel.app';
  const serverName = encodeURIComponent(server);
  const episodeId = encodeURIComponent(animeEpisodeId);
  const epParam = encodeURIComponent(String(ep));
  const categoryName = encodeURIComponent(category);

  const apiUrl = `${baseUrl}/api/v1/direct/${serverName}/${episodeId}::ep=${epParam}/${categoryName}`;
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
