import { Hono } from 'hono';
import { hianimeHomeController } from '../controllers/home.js';

const hianimeHomeRouter = new Hono();

hianimeHomeRouter.get('/', hianimeHomeController);

export default hianimeHomeRouter;
