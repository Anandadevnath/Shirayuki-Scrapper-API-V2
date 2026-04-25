import { getAnimekaiSearchResultsAdvanced } from '../scraper/search-advanced.js';

export const animekaiSearchAdvancedController = async (c) => {
	try {
		const q = c.req.query('q');
		const page = parseInt(c.req.query('page')) || 1;

		if (!q) {
			return c.json(
				{
					success: false,
					error: 'Query parameter "q" is required',
				},
				400
			);
		}

		const filters = {
			type: c.req.query('type'),
			sort: c.req.query('sort'),
			status: c.req.query('status'),
			season: c.req.query('season'),
			language: c.req.query('language'),
			year: c.req.query('year'),
			rating: c.req.query('rating'),
			country: c.req.query('country'),
			genre: c.req.query('genre'),
		};

		Object.keys(filters).forEach((key) => {
			if (filters[key] === undefined || filters[key] === null || filters[key] === '') {
				delete filters[key];
			}
		});

		const data = await getAnimekaiSearchResultsAdvanced(q, page, filters);
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
