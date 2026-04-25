import { Hono } from 'hono';
import { animekaiGenreController } from '../controllers/genre.js';

const animekaiGenreRouter = new Hono();

animekaiGenreRouter.get('/:name', animekaiGenreController);

export default animekaiGenreRouter;
