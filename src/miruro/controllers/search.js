import { searchMiruroAnime } from '../scraper/search.js';

export const miruroSearchController = async (c) => {
  try {
    const q = c.req.query('q') || '';
    const sort = c.req.query('sort') || 'POPULARITY_DESC';
    const page = parseInt(c.req.query('page') || '1', 10);
    const perPage = parseInt(c.req.query('perPage') || '20', 10);
    const type = c.req.query('type') || 'ANIME';
    const genre = c.req.query('genre') || null;
    const genres = c.req.queries('genres') || [];
    const format = c.req.query('format') || null;
    const status = c.req.query('status') || null;
    const season = c.req.query('season') || null;
    const year = c.req.query('year') || null;
    const startYear = c.req.query('startYear') || null;
    const endYear = c.req.query('endYear') || null;
    const tags = c.req.queries('tags') || [];

    const data = await searchMiruroAnime(
      q, sort, page, perPage, type, genre, genres, format, status, season, year, startYear, endYear, tags
    );

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
