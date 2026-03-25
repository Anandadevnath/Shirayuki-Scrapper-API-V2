import { Hono } from 'hono';
import { getStreamingServer } from '../scrapper/streaming-server.js';

const hianimeEpisodeSourcesRouter = new Hono();

hianimeEpisodeSourcesRouter.get('/', async (c) => {
  const animeEpisodeId = c.req.query('animeEpisodeId');
  const ep = c.req.query('ep');
  const server = c.req.query('server');
  const category = c.req.query('category');
  if (!animeEpisodeId || !ep) {
    return c.json({ status: 400, message: 'Missing required query parameters: animeEpisodeId and ep.' }, 400);
  }
  const data = await getStreamingServer({ animeEpisodeId, ep, server, category });
  const statusCode = typeof data?.status === 'number' ? data.status : 200;
  return c.json(data, statusCode);
});

export default hianimeEpisodeSourcesRouter;