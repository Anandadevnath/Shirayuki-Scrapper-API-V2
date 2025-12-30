import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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
