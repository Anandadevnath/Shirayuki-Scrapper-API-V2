import { Hono } from 'hono';
import { animekaiProducerController } from '../controllers/producer.js';

const animekaiProducerRouter = new Hono();

animekaiProducerRouter.get('/:name', animekaiProducerController);

export default animekaiProducerRouter;
