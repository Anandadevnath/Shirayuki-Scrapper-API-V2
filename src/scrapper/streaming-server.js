import axios from 'axios';

async function getStreamingServer({ animeEpisodeId, ep, server, category }) {
  const type = category === 'dub' ? 'dub' : 'sub';
  const episodeId = `${animeEpisodeId}::ep=${ep}`;
  const apiUrl = `https://v0-api-gateway-creation-one.vercel.app/api/embed-url-extractor?episodeId=${encodeURIComponent(episodeId)}&server=${server.toUpperCase()}&type=${type}`;

  try {
    const { data } = await axios.get(apiUrl);
    return data;
  } catch (error) {
    return {
      status: 500,
      message: 'Failed to fetch streaming server data',
      error: error.message,
    };
  }
}

export { getStreamingServer };
