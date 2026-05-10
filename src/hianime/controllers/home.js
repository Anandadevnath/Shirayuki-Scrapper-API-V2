import { getHiAnimeHomePage } from '../scraper/home.js';

export const hianimeHomeController = async (c) => {
  try {
    const data = await getHiAnimeHomePage();
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
