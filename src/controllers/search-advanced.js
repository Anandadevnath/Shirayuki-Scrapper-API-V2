import { getAnimeSearchResultsAdvanced } from '../scrapper/search-advanced.js';

export const searchAdvancedController = async (c) => {
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

    const filters = {
      genres: c.req.query('genres'),
      type: c.req.query('type'),
      status: c.req.query('status'),
      rated: c.req.query('rated'),
      score: c.req.query('score'),
      season: c.req.query('season'),
      language: c.req.query('language'),
      start_date: c.req.query('start_date'),
      end_date: c.req.query('end_date'),
      sort: c.req.query('sort'),
    };

    Object.keys(filters).forEach(key => {
      if (filters[key] === undefined || filters[key] === null) {
        delete filters[key];
      }
    });

    const data = await getAnimeSearchResultsAdvanced(q, page, filters);
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
