import { Hono } from 'hono';
import { animekaiSearchAdvancedController } from '../controllers/search-advanced.js';

const animekaiSearchAdvancedRouter = new Hono();

animekaiSearchAdvancedRouter.get('/', animekaiSearchAdvancedController);

export default animekaiSearchAdvancedRouter;
