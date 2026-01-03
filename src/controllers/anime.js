import { getAnimeAboutInfo } from '../scrapper/anime.js';

export const animeController = async (c) => {
  try {
    const animeId = c.req.param('animeId');

    if (!animeId) {
      return c.json(
        {
          success: false,
          error: 'animeId parameter is required',
        },
        400
      );
    }

    const data = await getAnimeAboutInfo(animeId);
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
