import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const SRC_HOME_URL = `${SRC_BASE_URL}/home`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function getNextEpisodeSchedule(animeId) {
  const res = {
    airingISOTimestamp: null,
    airingTimestamp: null,
    secondsUntilAiring: null,
  };

  try {
    animeId = animeId?.trim();
    
    if (!animeId || animeId.indexOf('-') === -1) {
      throw new Error('Invalid anime id');
    }

    const animeUrl = `${SRC_BASE_URL}/watch/${animeId}`;
    
    const { data } = await axios.get(animeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*',
        'Referer': SRC_HOME_URL,
      },
    });

    const $ = load(data);
    const selector = '.schedule-alert > .alert.small > span:last';

    const timestamp = String($(selector).attr('data-value')?.trim() || null);
    const schedule = new Date(timestamp);
    
    if (isNaN(schedule.getTime())) return res;

    res.airingISOTimestamp = schedule.toISOString();
    res.airingTimestamp = schedule.getTime();
    res.secondsUntilAiring = Math.floor((res.airingTimestamp - Date.now()) / 1000);

    return res;
  } catch (error) {
    throw new Error(`Failed to get next episode schedule: ${error.message}`);
  }
}
