import { Hono } from 'hono';
import { miruroSearchController } from '../controllers/search.js';

const miruroSearchRouter = new Hono();

miruroSearchRouter.get('/', miruroSearchController);

export default miruroSearchRouter;
