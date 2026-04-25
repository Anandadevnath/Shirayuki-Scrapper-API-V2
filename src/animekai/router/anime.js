import { Hono } from 'hono';
import { animekaiAnimeController } from '../controllers/anime.js';

const animekaiAnimeRouter = new Hono();

animekaiAnimeRouter.get('/:animeId', animekaiAnimeController);

export default animekaiAnimeRouter;
