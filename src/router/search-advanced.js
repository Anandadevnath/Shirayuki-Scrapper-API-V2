import { Hono } from 'hono';
import { searchAdvancedController } from '../controllers/search-advanced.js';

const searchAdvancedRouter = new Hono();

searchAdvancedRouter.get('/', searchAdvancedController);

export default searchAdvancedRouter;
