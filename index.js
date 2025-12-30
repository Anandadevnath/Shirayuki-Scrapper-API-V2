import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import env from './src/config/env.js';
import homeRouter from './src/router/home.js';
import azlistRouter from './src/router/azlist.js';
import animeRouter from './src/router/anime.js';
import searchRouter from './src/router/search.js';
import searchAdvancedRouter from './src/router/search-advanced.js';
import searchSuggestionRouter from './src/router/search-suggestion.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Root
app.get('/', (c) => {
  return c.json({
    message: 'Shirayuki Scrapper API V2',
    version: '2.0.0',
    endpoints: [
      '/api/v2/hianime/home',
      '/api/v2/hianime/azlist/:sortOption?page=:page',
      '/api/v2/hianime/anime/:animeId',
      '/api/v2/hianime/search?q=titan&page=1',
      '/api/v2/hianime/search?q=girls&genres=action,adventure&type=movie&sort=score&season=spring&language=dub&status=finished-airing&rated=pg-13&start_date=2014-0-0&score=good',
      '/api/v2/hianime/search/suggestion?q=titan'
    ]
  });
});

// API Routes
app.route('/api/v2/hianime/home', homeRouter);
app.route('/api/v2/hianime/azlist', azlistRouter);
app.route('/api/v2/hianime/anime', animeRouter);
app.route('/api/v2/hianime/search', searchRouter);
app.route('/api/v2/hianime/search/advanced', searchAdvancedRouter);
app.route('/api/v2/hianime/search/suggestion', searchSuggestionRouter);

app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found',
  }, 404);
});

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    error: err.message,
  }, 500);
});

const port = env.PORT;
console.log(`http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
