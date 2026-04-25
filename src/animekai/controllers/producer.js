import { getAnimekaiProducerAnime } from '../scraper/producer.js';

export const animekaiProducerController = async (c) => {
	try {
		const name = c.req.param('name');
		const page = parseInt(c.req.query('page')) || 1;

		if (!name) {
			return c.json(
				{
					success: false,
					error: 'Producer name parameter is required',
				},
				400
			);
		}

		const data = await getAnimekaiProducerAnime(name, page);
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
