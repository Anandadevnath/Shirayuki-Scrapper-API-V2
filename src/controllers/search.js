import { getAnimeSearchResults } from '../scrapper/search.js';

export const searchController = async (c) => {
  try {
    const q = c.req.query('q');
    const page = parseInt(c.req.query('page')) || 1;

    if (!q) {
      return c.json(
        {
          success: false,
          error: 'Query parameter "q" is required',
        },
        400
      );
    }

    const data = await getAnimeSearchResults(q, page);
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
