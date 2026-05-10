import { Hono } from 'hono';
import { miruroHomeController } from '../controllers/home.js';

const miruroHomeRouter = new Hono();

miruroHomeRouter.get('/', miruroHomeController);

export default miruroHomeRouter;
