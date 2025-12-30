import { Hono } from 'hono';
import { animeController } from '../controllers/anime.js';

const animeRouter = new Hono();

animeRouter.get('/:animeId', animeController);

export default animeRouter;
