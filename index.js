import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import env from './src/config/env.js';
import homeRouter from './src/router/home.js';
import azlistRouter from './src/router/azlist.js';
import animeRouter from './src/router/anime.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Shirayuki Scrapper API V2',
    version: '2.0.0',
    endpoints: [
      '/api/v2/hianime/home',
      '/api/v2/hianime/azlist/:sortOption?page=:page',
      '/api/v2/hianime/anime/:animeId'
    ]
  });
});

// API Routes
app.route('/api/v2/hianime/home', homeRouter);
app.route('/api/v2/hianime/azlist', azlistRouter);
app.route('/api/v2/hianime/anime', animeRouter);

// 404 handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'Endpoint not found',
  }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    error: err.message,
  }, 500);
});

// Start server
const port = env.PORT;
console.log(`http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
