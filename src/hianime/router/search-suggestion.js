import { Hono } from 'hono';
import { hianimeSearchSuggestionController } from '../controllers/search-suggestion.js';

const hianimeSearchSuggestionRouter = new Hono();

hianimeSearchSuggestionRouter.get('/', hianimeSearchSuggestionController);

export default hianimeSearchSuggestionRouter;
