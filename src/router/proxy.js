import { Hono } from 'hono';
import { proxyController } from '../controllers/proxy.js';

const proxyRouter = new Hono();

proxyRouter.get('/', proxyController);

export default proxyRouter;
