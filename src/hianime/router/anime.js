import { Hono } from 'hono';
import { hianimeAnimeController } from '../controllers/anime.js';

const hianimeAnimeRouter = new Hono();

hianimeAnimeRouter.get('/:animeId', hianimeAnimeController);

export default hianimeAnimeRouter;
