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

    const data = await getAnimekaiEpisodeSources({ animeEpisodeId, ep, server, category });
    const warnings = [];
    if (!ep || !server || !category) {
      warnings.push(
        'If you are calling this endpoint from a browser, remember that anything after `#` is a URL fragment and is NOT sent to the server. Use query params like `&ep=1&server=server-1&category=sub` (not `#ep=1...`).'
      );
    }

    return c.json({
      success: true,
      data,
      ...(warnings.length ? { warnings } : {}),
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
