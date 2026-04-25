import { Hono } from 'hono';
import { animekaiEpisodeSourcesController } from '../controllers/episode-sources.js';

const animekaiEpisodeSourcesRouter = new Hono();

animekaiEpisodeSourcesRouter.get('/', animekaiEpisodeSourcesController);

export default animekaiEpisodeSourcesRouter;
