import { Hono } from 'hono';
import { categoryController } from '../controllers/category.js';

const categoryRouter = new Hono();

categoryRouter.get('/:name', categoryController);

export default categoryRouter;
