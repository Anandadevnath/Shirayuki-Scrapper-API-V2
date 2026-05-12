export const animekaiProxyController = async (c) => {
  try {
    const url = c.req.query('url');
    if (!url) {
      return c.json(
        {
          success: false,
          error: 'URL parameter is required',
        },
        400
      );
    }

    const response = await fetch(url);
    const data = await response.text();

    return c.text(data, response.status);
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
