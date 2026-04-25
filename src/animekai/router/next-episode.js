import { Hono } from 'hono';
import { animekaiNextEpisodeController } from '../controllers/next-episode.js';

const animekaiNextEpisodeRouter = new Hono();

animekaiNextEpisodeRouter.get('/:animeId/next-episode-schedule', animekaiNextEpisodeController);

export default animekaiNextEpisodeRouter;
