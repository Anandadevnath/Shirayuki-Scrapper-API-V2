import { getHiAnimeSearchSuggestion } from '../scraper/search-suggestion.js';

export const hianimeSearchSuggestionController = async (c) => {
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

		const data = await getHiAnimeSearchSuggestion(q);
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
