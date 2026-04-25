import { getAnimekaiEpisodeServers } from '../scraper/episode-servers.js';

export const animekaiEpisodeServersController = async (c) => {
	try {
		const animeEpisodeId = c.req.query('animeEpisodeId');
		const ep = c.req.query('ep');

		if (!animeEpisodeId) {
			return c.json(
				{
					success: false,
					error: 'animeEpisodeId query parameter is required',
				},
				400
			);
		}

		const data = await getAnimekaiEpisodeServers({ animeEpisodeId, ep });
		return c.json({
			success: true,
			data,
		});
	} catch (error) {
		return c.json(
			{
				success: false,
				error: error.message,
			},
			500
		);
	}
};
