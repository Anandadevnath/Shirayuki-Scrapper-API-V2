import { Hono } from 'hono';
import { genreController } from '../controllers/genre.js';

const genreRouter = new Hono();

genreRouter.get('/:name', genreController);

export default genreRouter;
