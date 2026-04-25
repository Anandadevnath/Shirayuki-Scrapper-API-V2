import { Hono } from 'hono';
import { animekaiSearchSuggestionController } from '../controllers/search-suggestion.js';

const animekaiSearchSuggestionRouter = new Hono();

animekaiSearchSuggestionRouter.get('/', animekaiSearchSuggestionController);

export default animekaiSearchSuggestionRouter;
