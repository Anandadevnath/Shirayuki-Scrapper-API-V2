import { Hono } from 'hono';
import { hianimeSearchAdvancedController } from '../controllers/search-advanced.js';

const hianimeSearchAdvancedRouter = new Hono();

hianimeSearchAdvancedRouter.get('/', hianimeSearchAdvancedController);

export default hianimeSearchAdvancedRouter;
