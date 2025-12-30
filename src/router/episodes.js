import { Hono } from 'hono';
import { episodesController } from '../controllers/episodes.js';

const episodesRouter = new Hono();

episodesRouter.get('/:animeId/episodes', episodesController);

export default episodesRouter;
