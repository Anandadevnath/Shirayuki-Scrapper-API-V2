import { getAnimekaiCategoryAnime } from '../scraper/category.js';

export const animekaiCategoryController = async (c) => {
	try {
		const name = c.req.param('name');
		const page = parseInt(c.req.query('page')) || 1;

		if (!name) {
			return c.json(
				{
					success: false,
					error: 'Category name parameter is required',
				},
				400
			);
		}

		const data = await getAnimekaiCategoryAnime(name, page);
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
