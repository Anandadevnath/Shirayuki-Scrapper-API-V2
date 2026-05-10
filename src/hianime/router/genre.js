import { Hono } from 'hono';
import { hianimeGenreController } from '../controllers/genre.js';

const hianimeGenreRouter = new Hono();

hianimeGenreRouter.get('/:name', hianimeGenreController);

export default hianimeGenreRouter;
