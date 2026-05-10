import { Hono } from 'hono';
import { hianimeProducerController } from '../controllers/producer.js';

const hianimeProducerRouter = new Hono();

hianimeProducerRouter.get('/:name', hianimeProducerController);

export default hianimeProducerRouter;
