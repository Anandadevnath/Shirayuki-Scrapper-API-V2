import { Hono } from 'hono';
import { scheduleController } from '../controllers/schedule.js';

const scheduleRouter = new Hono();

scheduleRouter.get('/', scheduleController);

export default scheduleRouter;
