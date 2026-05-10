import { Hono } from 'hono';
import { hianimeScheduleController } from '../controllers/schedule.js';

const hianimeScheduleRouter = new Hono();

hianimeScheduleRouter.get('/', hianimeScheduleController);

export default hianimeScheduleRouter;
