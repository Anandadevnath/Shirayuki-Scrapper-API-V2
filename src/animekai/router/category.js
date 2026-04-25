import { Hono } from 'hono';
import { animekaiCategoryController } from '../controllers/category.js';

const animekaiCategoryRouter = new Hono();

animekaiCategoryRouter.get('/:name', animekaiCategoryController);

export default animekaiCategoryRouter;
