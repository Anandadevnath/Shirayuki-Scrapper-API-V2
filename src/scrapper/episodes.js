import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;

export async function getAnimeEpisodes(animeId) {
  const res = {
    totalEpisodes: 0,
    episodes: [],
  };

  try {
    if (animeId.trim() === '' || animeId.indexOf('-') === -1) {
      throw new Error('Invalid anime id');
    }

    const { data } = await axios.get(
      `${SRC_AJAX_URL}/v2/episode/list/${animeId.split('-').pop()}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${SRC_BASE_URL}/watch/${animeId}`,
        },
      }
    );

    const $ = load(data.html);

    res.totalEpisodes = Number($('.detail-infor-content .ss-list a').length);

    $('.detail-infor-content .ss-list a').each((_, el) => {
      res.episodes.push({
        title: $(el)?.attr('title')?.trim() || null,
        episodeId: $(el)?.attr('href')?.split('/')?.pop() || null,
        number: Number($(el).attr('data-number')),
        isFiller: $(el).hasClass('ssl-item-filler'),
      });
    });

    return res;
  } catch (error) {
    throw new Error(`Failed to get anime episodes: ${error.message}`);
  }
}
