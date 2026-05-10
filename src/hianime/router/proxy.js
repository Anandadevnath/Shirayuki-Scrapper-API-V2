import { Hono } from 'hono';
import { hianimeProxyController } from '../controllers/proxy.js';

const hianimeProxyRouter = new Hono();

hianimeProxyRouter.get('/', hianimeProxyController);

export default hianimeProxyRouter;
