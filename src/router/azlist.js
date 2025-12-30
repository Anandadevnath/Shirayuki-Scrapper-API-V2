import { Hono } from 'hono';
import { azlistController } from '../controllers/azlist.js';

const azlistRouter = new Hono();

azlistRouter.get('/:sortOption', azlistController);

export default azlistRouter;
