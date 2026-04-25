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
import hianimeEpisodeSourcesRouter from './src/router/streaming-server.js';
import proxyRouter from './src/router/proxy.js';
import animekaiHomeRouter from './src/animekai/router/home.js';
import animekaiAzlistRouter from './src/animekai/router/azlist.js';
import animekaiAnimeRouter from './src/animekai/router/anime.js';
import animekaiSearchRouter from './src/animekai/router/search.js';
import animekaiSearchAdvancedRouter from './src/animekai/router/search-advanced.js';
import animekaiSearchSuggestionRouter from './src/animekai/router/search-suggestion.js';
import animekaiProducerRouter from './src/animekai/router/producer.js';
import animekaiGenreRouter from './src/animekai/router/genre.js';
import animekaiCategoryRouter from './src/animekai/router/category.js';
import animekaiScheduleRouter from './src/animekai/router/schedule.js';
import animekaiEpisodesRouter from './src/animekai/router/episodes.js';
import animekaiNextEpisodeRouter from './src/animekai/router/next-episode.js';
import animekaiEpisodeServersRouter from './src/animekai/router/episode-servers.js';
import animekaiEpisodeSourcesRouter from './src/animekai/router/streaming-server.js';
import animekaiProxyRouter from './src/animekai/router/proxy.js';
import { animekaiEpisodesController } from './src/animekai/controllers/episodes.js';

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
      episodeSources: '/api/v2/hianime/episode/sources?animeEpisodeId=steinsgate-3&ep=230&server=hd-2&category=sub',
      animekaiHome: '/api/v2/animekai/home',
      animekaiAzlist: '/api/v2/animekai/azlist/0-9?page=1',
      animekaiDetails: '/api/v2/animekai/anime/one-piece-dk6r',
      animekaiEpisodes: '/api/v2/animekai/anime/one-piece-dk6r/episodes',
      animekaiEpisodesCompat: '/api/v2/animekai/one-piece-dk6r/episodes',
      animekaiSearch: '/api/v2/animekai/search?q=one%20piece&page=1',
      animekaiSearchAdvanced: '/api/v2/animekai/search/advanced?q=one%20piece&page=1',
      animekaiSearchSuggestion: '/api/v2/animekai/search/suggestion?q=one',
      animekaiProducer: '/api/v2/animekai/producer/toei-animation?page=1',
      animekaiGenre: '/api/v2/animekai/genre/action?page=1',
      animekaiCategory: '/api/v2/animekai/category/tv?page=1',
      animekaiSchedule: '/api/v2/animekai/schedule?date=2026-01-01',
      animekaiEpisodeServers: '/api/v2/animekai/episode/servers?animeEpisodeId=example',
      animekaiEpisodeSources:
        '/api/v2/animekai/episode/sources?animeEpisodeId=witch-hat-atelier-3e32&ep=1&server=server-1&category=sub',
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
app.route('/api/v2/hianime/episode/sources', hianimeEpisodeSourcesRouter);
app.route('/api/v2/hianime/proxy', proxyRouter);
app.route('/api/v2/animekai/home', animekaiHomeRouter);
app.route('/api/v2/animekai/azlist', animekaiAzlistRouter);
app.route('/api/v2/animekai/anime', animekaiAnimeRouter);
app.route('/api/v2/animekai/search', animekaiSearchRouter);
app.route('/api/v2/animekai/search/advanced', animekaiSearchAdvancedRouter);
app.route('/api/v2/animekai/search/suggestion', animekaiSearchSuggestionRouter);
app.route('/api/v2/animekai/producer', animekaiProducerRouter);
app.route('/api/v2/animekai/genre', animekaiGenreRouter);
app.route('/api/v2/animekai/category', animekaiCategoryRouter);
app.route('/api/v2/animekai/schedule', animekaiScheduleRouter);
app.route('/api/v2/animekai/anime', animekaiEpisodesRouter);
app.route('/api/v2/animekai/anime', animekaiNextEpisodeRouter);

app.route('/api/v2/animekai/episode', animekaiEpisodeServersRouter);
app.route('/api/v2/animekai/episode/sources', animekaiEpisodeSourcesRouter);
app.route('/api/v2/animekai/proxy', animekaiProxyRouter);

// Compatibility alias: supports /api/v2/animekai/:animeId/episodes format.
app.get('/api/v2/animekai/:animeId/episodes', animekaiEpisodesController);

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
