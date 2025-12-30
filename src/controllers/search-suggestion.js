import { getAnimeSearchSuggestion } from '../scrapper/search-suggestion.js';

/**
 * Controller for search suggestion endpoint
 */
export const searchSuggestionController = async (c) => {
  try {
    const q = c.req.query('q');

    if (!q) {
      return c.json(
        {
          success: false,
          error: 'Query parameter "q" is required',
        },
        400
      );
    }

    const data = await getAnimeSearchSuggestion(q);
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
