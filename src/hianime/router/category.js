import { Hono } from 'hono';
import { hianimeCategoryController } from '../controllers/category.js';

const hianimeCategoryRouter = new Hono();

hianimeCategoryRouter.get('/:name', hianimeCategoryController);

export default hianimeCategoryRouter;
