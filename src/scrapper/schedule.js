import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;
const SRC_HOME_URL = `${SRC_BASE_URL}/home`;

export async function getEstimatedSchedule(date, tzOffset = -330) {
  const res = {
    scheduledAnimes: [],
  };

  try {
    date = date?.trim();
    
    if (date === '' || /^\d{4}-\d{2}-\d{2}$/.test(date) === false) {
      throw new Error('Invalid date format. Use YYYY-MM-DD format.');
    }

    if (tzOffset && (typeof tzOffset !== 'number' || isNaN(tzOffset))) {
      throw new Error('Invalid timezone offset');
    }

    const estScheduleURL = `${SRC_AJAX_URL}/schedule/list?tzOffset=${tzOffset}&date=${date}`;

    const { data } = await axios.get(estScheduleURL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Referer': SRC_HOME_URL,
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    const $ = load(data?.html);
    const selector = 'li';

    if ($(selector)?.text()?.trim()?.includes('No data to display')) {
      return res;
    }

    $(selector).each((_, el) => {
      const airingTimestamp = new Date(
        `${date}T${$(el)?.find('a .time')?.text()?.trim()}:00`
      ).getTime();

      res.scheduledAnimes.push({
        id: $(el)?.find('a')?.attr('href')?.slice(1)?.trim() || null,
        time: $(el)?.find('a .time')?.text()?.trim() || null,
        name: $(el)?.find('a .film-name.dynamic-name')?.text()?.trim() || null,
        jname: $(el)
          ?.find('a .film-name.dynamic-name')
          ?.attr('data-jname')
          ?.trim() || null,
        airingTimestamp,
        secondsUntilAiring: Math.floor((airingTimestamp - Date.now()) / 1000),
        episode: Number(
          $(el).find('a .fd-play button').text().trim().split(' ')[1]
        ),
      });
    });

    return res;
  } catch (error) {
    throw new Error(`Failed to get estimated schedule: ${error.message}`);
  }
}
