import { getAnimekaiSchedule } from '../scraper/schedule.js';

export const animekaiScheduleController = async (c) => {
	try {
		const date = c.req.query('date');
		if (!date) {
			return c.json({ success: false, error: 'Missing date query parameter.' }, 400);
		}
		const schedule = await getAnimekaiSchedule(date);
		return c.json({ 
			success: true, 
			schedule,
			requestedDate: date
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
};