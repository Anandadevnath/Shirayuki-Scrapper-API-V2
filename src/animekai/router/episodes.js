import { Hono } from 'hono';
import { animekaiEpisodesController } from '../controllers/episodes.js';

const animekaiEpisodesRouter = new Hono();

animekaiEpisodesRouter.get('/:animeId/episodes', animekaiEpisodesController);

export default animekaiEpisodesRouter;
