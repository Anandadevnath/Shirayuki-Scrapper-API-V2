import { getEpisodeServers } from '../scrapper/episode-servers.js';

export const episodeServersController = async (c) => {
  try {
    const animeEpisodeId = c.req.query('animeEpisodeId');

    if (!animeEpisodeId) {
      return c.json(
        {
          success: false,
          error: 'animeEpisodeId query parameter is required',
        },
        400
      );
    }

    const data = await getEpisodeServers(animeEpisodeId);
    return c.json({
      success: true,
      data,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: error.message,
      },
      500
    );
  }
};
