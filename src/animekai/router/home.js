import { Hono } from 'hono';
import { animekaiHomeController } from '../controllers/home.js';

const animekaiHomeRouter = new Hono();

animekaiHomeRouter.get('/', animekaiHomeController);

export default animekaiHomeRouter;
