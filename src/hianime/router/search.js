import { Hono } from 'hono';
import { hianimeSearchController } from '../controllers/search.js';

const hianimeSearchRouter = new Hono();

hianimeSearchRouter.get('/', hianimeSearchController);

export default hianimeSearchRouter;
