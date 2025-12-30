import { Hono } from 'hono';
import { nextEpisodeController } from '../controllers/next-episode.js';

const nextEpisodeRouter = new Hono();

nextEpisodeRouter.get('/:animeId/next-episode-schedule', nextEpisodeController);

export default nextEpisodeRouter;
