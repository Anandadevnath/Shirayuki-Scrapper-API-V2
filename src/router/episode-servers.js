import { Hono } from 'hono';
import { episodeServersController } from '../controllers/episode-servers.js';

const episodeServersRouter = new Hono();

episodeServersRouter.get('/servers', episodeServersController);

export default episodeServersRouter;
