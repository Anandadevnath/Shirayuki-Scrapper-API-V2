import { getAnimekaiEpisodeSources } from '../scraper/episode-sources.js';

export const animekaiEpisodeSourcesController = async (c) => {
  try {
    const animeEpisodeId = c.req.query('animeEpisodeId');
    const ep = c.req.query('ep');
    const server = c.req.query('server');
    const category = c.req.query('category');

    if (!animeEpisodeId) {
      return c.json(
        {
          success: false,
          error: 'animeEpisodeId query parameter is required',
        },
        400
      );
    }

    const startTime = Date.now();
    const data = await getAnimekaiEpisodeSources({ animeEpisodeId, ep, server, category });
    const extractionTimeSec = Number(((Date.now() - startTime) / 1000).toFixed(3));

    return c.json({
      success: true,
      data,
      extractionTimeSec,
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
