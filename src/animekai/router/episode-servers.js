import { Hono } from 'hono';
import { animekaiEpisodeServersController } from '../controllers/episode-servers.js';

const animekaiEpisodeServersRouter = new Hono();

animekaiEpisodeServersRouter.get('/servers', animekaiEpisodeServersController);

export default animekaiEpisodeServersRouter;
