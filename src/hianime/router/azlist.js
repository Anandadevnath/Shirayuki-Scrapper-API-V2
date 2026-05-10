import { Hono } from 'hono';
import { hianimeAzlistController } from '../controllers/azlist.js';

const hianimeAzlistRouter = new Hono();

hianimeAzlistRouter.get('/:sortOption', hianimeAzlistController);

export default hianimeAzlistRouter;
