import { getGenreAnime } from '../scrapper/genre.js';


export const genreController = async (c) => {
  try {
    const name = c.req.param('name');
    const page = parseInt(c.req.query('page')) || 1;

    if (!name) {
      return c.json(
        {
          success: false,
          error: 'Genre name parameter is required',
        },
        400
      );
    }

    const data = await getGenreAnime(name, page);
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
