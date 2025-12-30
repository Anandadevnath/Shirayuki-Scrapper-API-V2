import { Hono } from 'hono';
import { searchController } from '../controllers/search.js';

const searchRouter = new Hono();

searchRouter.get('/', searchController);

export default searchRouter;
