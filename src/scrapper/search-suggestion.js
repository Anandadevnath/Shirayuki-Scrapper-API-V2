import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;
const SRC_HOME_URL = `${SRC_BASE_URL}/home`;

export async function getAnimeSearchSuggestion(q) {
  const res = {
    suggestions: [],
  };

  try {
    q = q.trim() ? decodeURIComponent(q.trim()) : '';
    
    if (q.trim() === '') {
      throw new Error('Invalid search query');
    }

    const { data } = await axios.get(
      `${SRC_AJAX_URL}/search/suggest?keyword=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': '*/*',
          'Pragma': 'no-cache',
          'Referer': SRC_HOME_URL,
          'X-Requested-With': 'XMLHttpRequest',
        },
      }
    );

    const $ = load(data.html);
    const selector = '.nav-item:has(.film-poster)';

    if ($(selector).length < 1) return res;

    $(selector).each((_, el) => {
      const id = $(el).attr('href')?.split('?')[0].includes('javascript')
        ? null
        : $(el).attr('href')?.split('?')[0]?.slice(1) || null;

      res.suggestions.push({
        id,
        name: $(el).find('.srp-detail .film-name')?.text()?.trim() || null,
        jname: $(el)
          .find('.srp-detail .film-name')
          ?.attr('data-jname')
          ?.trim() ||
          $(el).find('.srp-detail .alias-name')?.text()?.trim() ||
          null,
        poster: $(el)
          .find('.film-poster .film-poster-img')
          ?.attr('data-src')
          ?.trim() || null,
        moreInfo: [
          ...$(el)
            .find('.film-infor')
            .contents()
            .map((_, el) => $(el).text().trim()),
        ].filter((i) => i),
      });
    });

    return res;
  } catch (error) {
    throw new Error(`Failed to get search suggestions: ${error.message}`);
  }
}
