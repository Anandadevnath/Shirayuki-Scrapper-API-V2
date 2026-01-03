
import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
import { extractAnimes, extractMostPopularAnimes } from '../utils/scrapper-helpers.js';
const SRC_SEARCH_URL = `${SRC_BASE_URL}/search`;

export async function getAnimeSearchResults(q, page = 1) {
  const res = {
    animes: [],
    mostPopularAnimes: [],
    searchQuery: q,
    totalPages: 0,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  try {
    q = q.trim() ? decodeURIComponent(q.trim()) : '';
    
    if (q.trim() === '') {
      throw new Error('Invalid search query');
    }

    page = res.currentPage;

    const url = new URL(SRC_SEARCH_URL);
    url.searchParams.set('keyword', q);
    url.searchParams.set('page', `${page}`);

    const { data } = await axios.get(url.href, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const selector = '#main-content .tab-content .film_list-wrap .flw-item';

    // Check pagination
    res.hasNextPage =
      $('.pagination > li').length > 0
        ? $('.pagination li.active').length > 0
          ? $('.pagination > li').last().hasClass('active')
            ? false
            : true
          : false
        : false;

    res.totalPages =
      Number(
        $('.pagination > .page-item a[title="Last"]')
          ?.attr('href')
          ?.split('=')
          .pop() ??
          $('.pagination > .page-item a[title="Next"]')
            ?.attr('href')
            ?.split('=')
            .pop() ??
          $('.pagination > .page-item.active a')?.text()?.trim()
      ) || 1;

    res.animes = extractAnimes($, selector);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    // Most popular animes
    const mostPopularSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.mostPopularAnimes = extractMostPopularAnimes($, mostPopularSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to search anime: ${error.message}`);
  }
}
