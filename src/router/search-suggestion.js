import { Hono } from 'hono';
import { searchSuggestionController } from '../controllers/search-suggestion.js';

const searchSuggestionRouter = new Hono();

searchSuggestionRouter.get('/', searchSuggestionController);

export default searchSuggestionRouter;
