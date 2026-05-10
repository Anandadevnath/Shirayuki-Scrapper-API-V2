import { getHiAnimeAnimeDetails } from '../scraper/anime.js';

export const hianimeAnimeController = async (c) => {
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

    const data = await getHiAnimeAnimeDetails(animeId);
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
