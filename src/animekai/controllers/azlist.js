import { getAnimekaiAZList } from '../scraper/azlist.js';

export const animekaiAzlistController = async (c) => {
	try {
		const sortOption = c.req.param('sortOption') || 'all';
		const page = parseInt(c.req.query('page')) || 1;

		const data = await getAnimekaiAZList(sortOption, page);
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
