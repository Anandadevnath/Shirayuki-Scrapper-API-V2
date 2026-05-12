import { getHianimHomePage } from '../scraper/home.js';

export const hianimHomeController = async (c) => {
  try {
    const data = await getHianimHomePage();
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
