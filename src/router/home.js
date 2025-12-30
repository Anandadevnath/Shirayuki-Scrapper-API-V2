import { Hono } from 'hono';
import { homeController } from '../controllers/home.js';

const homeRouter = new Hono();

homeRouter.get('/', homeController);

export default homeRouter;
