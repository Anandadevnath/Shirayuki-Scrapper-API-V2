import { Hono } from 'hono';
import { producerController } from '../controllers/producer.js';

const producerRouter = new Hono();

producerRouter.get('/:name', producerController);

export default producerRouter;
