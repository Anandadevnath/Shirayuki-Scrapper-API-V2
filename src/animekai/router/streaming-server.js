import { Hono } from 'hono';
import { animekaiNotImplementedController } from '../controllers/_not-implemented.js';

const animekaiEpisodeSourcesRouter = new Hono();

animekaiEpisodeSourcesRouter.get('/', animekaiNotImplementedController('episode-sources'));

export default animekaiEpisodeSourcesRouter;
