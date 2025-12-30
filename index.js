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
import producerRouter from './src/router/producer.js';
import genreRouter from './src/router/genre.js';
import categoryRouter from './src/router/category.js';
import scheduleRouter from './src/router/schedule.js';
import episodesRouter from './src/router/episodes.js';
import nextEpisodeRouter from './src/router/next-episode.js';
import episodeServersRouter from './src/router/episode-servers.js';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Root
app.get('/', (c) => {
  return c.json({
    message: 'Shirayuki Scrapper API V2',
    version: '2.0.0',
    Endpoints: {
      home: '/api/v2/hianime/home',
      azlist: '/api/v2/hianime/azlist/0-9?page=1',
      animeDetails: '/api/v2/hianime/anime/attack-on-titan-112',
      animeEpisodes: '/api/v2/hianime/anime/steinsgate-3/episodes',
      searchBasic: '/api/v2/hianime/search?q=titan&page=1',
      searchAdvanced: '/api/v2/hianime/search/advanced?q=girls&genres=action,adventure&type=movie&sort=score&season=spring&language=dub&status=finished-airing&rated=pg-13&start_date=2014-0-0&score=good',
      searchSuggestion: '/api/v2/hianime/search/suggestion?q=titan',
      producer: '/api/v2/hianime/producer/toei-animation?page=2',
      genre: '/api/v2/hianime/genre/shounen?page=2',
      category: '/api/v2/hianime/category/tv?page=2',
      schedule: '/api/v2/hianime/schedule?date=2024-01-01',
      episodeServers: '/api/v2/hianime/episode/servers?animeEpisodeId=steinsgate-3?ep=213',
      episodeSources: '/api/v2/hianime/episode/sources?animeEpisodeId=steinsgate-3?ep=213&server=hd-1&category=sub'
    }
  });
});

// API Routes
app.route('/api/v2/hianime/home', homeRouter);
app.route('/api/v2/hianime/azlist', azlistRouter);
app.route('/api/v2/hianime/anime', animeRouter);
app.route('/api/v2/hianime/search', searchRouter);
app.route('/api/v2/hianime/search/advanced', searchAdvancedRouter);
app.route('/api/v2/hianime/search/suggestion', searchSuggestionRouter);
app.route('/api/v2/hianime/producer', producerRouter);
app.route('/api/v2/hianime/genre', genreRouter);
app.route('/api/v2/hianime/category', categoryRouter);
app.route('/api/v2/hianime/schedule', scheduleRouter);
app.route('/api/v2/hianime/anime', episodesRouter);
app.route('/api/v2/hianime/anime', nextEpisodeRouter);
app.route('/api/v2/hianime/episode', episodeServersRouter);

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
