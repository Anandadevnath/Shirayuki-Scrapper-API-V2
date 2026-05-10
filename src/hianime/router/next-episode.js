import { Hono } from 'hono';
import { hianimeNextEpisodeController } from '../controllers/next-episode.js';

const hianimeNextEpisodeRouter = new Hono();

hianimeNextEpisodeRouter.get('/:animeId/next-episode-schedule', hianimeNextEpisodeController);

export default hianimeNextEpisodeRouter;
