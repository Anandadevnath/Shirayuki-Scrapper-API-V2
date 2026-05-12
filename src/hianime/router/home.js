import { Hono } from 'hono';
import { hianimHomeController } from '../controllers/home.js';

const hianimHomeRouter = new Hono();

hianimHomeRouter.get('/', hianimHomeController);

export default hianimHomeRouter;
