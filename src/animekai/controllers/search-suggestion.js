import { getAnimekaiSearchSuggestion } from '../scraper/search-suggestion.js';

export const animekaiSearchSuggestionController = async (c) => {
	try {
		const q = c.req.query('q');

		if (!q) {
			return c.json(
				{
					success: false,
					error: 'Query parameter "q" is required',
				},
				400
			);
		}

		const data = await getAnimekaiSearchSuggestion(q);
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
