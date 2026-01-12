import { Hono } from 'hono';
import { getStreamingServer } from '../scrapper/streaming-server.js';

const hianimeEpisodeSourcesRouter = new Hono();

hianimeEpisodeSourcesRouter.get('/', async (c) => {
  const animeEpisodeId = c.req.query('animeEpisodeId');
  const ep = c.req.query('ep');
  const server = c.req.query('server');
  const category = c.req.query('category');
  if (!animeEpisodeId || !ep || !server || !category) {
    return c.json({ status: 400, message: 'Missing required query parameters.' }, 400);
  }
  const data = await getStreamingServer({ animeEpisodeId, ep, server, category });
  return c.json(data);
});

export default hianimeEpisodeSourcesRouter;
