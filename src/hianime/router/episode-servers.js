import { Hono } from 'hono';
import { hianimeEpisodeServersController } from '../controllers/episode-servers.js';

const hianimeEpisodeServersRouter = new Hono();

hianimeEpisodeServersRouter.get('/servers', hianimeEpisodeServersController);

export default hianimeEpisodeServersRouter;
