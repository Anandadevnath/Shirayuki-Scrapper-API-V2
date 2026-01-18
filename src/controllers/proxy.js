import axios from 'axios';

export const proxyController = async (c) => {
  try {
    const url = c.req.query('url');
    const referer = c.req.query('referer');
    if (!url) {
      return c.json({ success: false, error: 'Missing url query parameter.' }, 400);
    }
    const headers = {};
    if (referer) headers['Referer'] = referer;
    headers['User-Agent'] =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
    const response = await axios.get(url, {
      headers,
      responseType: 'stream',
      timeout: 15000,
      validateStatus: () => true,
    });
    c.header('content-type', response.headers['content-type'] || 'application/octet-stream');
    c.header('access-control-allow-origin', '*');
    c.status(response.status);
    return new Response(response.data, {
      status: response.status,
      headers: {
        'content-type': response.headers['content-type'] || 'application/octet-stream',
        'access-control-allow-origin': '*',
      },
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
};
