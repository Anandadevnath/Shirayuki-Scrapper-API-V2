import { Hono } from 'hono';
import { animekaiSearchController } from '../controllers/search.js';

const animekaiSearchRouter = new Hono();

animekaiSearchRouter.get('/', animekaiSearchController);

export default animekaiSearchRouter;
