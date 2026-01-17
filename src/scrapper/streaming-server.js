import axios from 'axios';

async function getStreamingServer({ animeEpisodeId, ep, server, category }) {
  const apiUrl = 'https://hianimez-red.vercel.app/api/v1/direct/hd-2/one-piece-100::ep=2142/sub';

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
