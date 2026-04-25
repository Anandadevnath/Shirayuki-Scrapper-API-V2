import { Hono } from 'hono';
import { animekaiAzlistController } from '../controllers/azlist.js';

const animekaiAzlistRouter = new Hono();

animekaiAzlistRouter.get('/:sortOption', animekaiAzlistController);

export default animekaiAzlistRouter;
