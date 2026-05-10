import { getMiruroCompleteHome } from '../scraper/home.js';

export const miruroHomeController = async (c) => {
  try {
    const data = await getMiruroCompleteHome();
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
