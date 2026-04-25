import { Hono } from 'hono';
import { animekaiScheduleController } from '../controllers/schedule.js';

const animekaiScheduleRouter = new Hono();

animekaiScheduleRouter.get('/', animekaiScheduleController);

export default animekaiScheduleRouter;
