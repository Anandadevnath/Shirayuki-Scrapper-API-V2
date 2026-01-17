import axios from 'axios';

async function getStreamingServer({ animeEpisodeId, ep, server, category }) {
  const type = category === 'dub' ? 'dub' : 'sub';
  const episodeId = `${animeEpisodeId}::ep=${ep}`;
  const apiUrl = `https://hianimez-red.vercel.app/api/v1/direct/${server}/${episodeId}/${type}`;

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
