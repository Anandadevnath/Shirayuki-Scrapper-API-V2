import { getHomePage } from '../scrapper/home.js';

export const homeController = async (c) => {
  try {
    const data = await getHomePage();
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
