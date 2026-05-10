import { Hono } from 'hono';
import { miruroAnimeController } from '../controllers/anime.js';

const miruroAnimeRouter = new Hono();

miruroAnimeRouter.get('/:animeId', miruroAnimeController);

export default miruroAnimeRouter;
