import { getAnimekaiHomePage } from '../scraper/home.js';

export const animekaiHomeController = async (c) => {
  try {
    const data = await getAnimekaiHomePage();
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
