import { Hono } from 'hono';
import { hianimeEpisodesController } from '../controllers/episodes.js';

const hianimeEpisodesRouter = new Hono();

hianimeEpisodesRouter.get('/:animeId/episodes', hianimeEpisodesController);

export default hianimeEpisodesRouter;
