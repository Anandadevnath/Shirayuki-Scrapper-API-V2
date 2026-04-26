import { getAnimekaiAnimeDetails } from '../scraper/anime.js';

export const animekaiAnimeController = async (c) => {
  try {
    const animeId = c.req.param('animeId');

    if (!animeId) {
      return c.json(
        {
          success: false,
          error: 'Anime ID is required',
        },
        400
      );
    }

    const data = await getAnimekaiAnimeDetails(animeId);
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
