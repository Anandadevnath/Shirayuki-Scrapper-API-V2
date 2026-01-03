import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
import { extractAnimes } from '../utils/scrapper-helpers.js';

const AZ_LIST_SORT_OPTIONS = {
  all: true,
  other: true,
  '0-9': true,
  a: true,
  b: true,
  c: true,
  d: true,
  e: true,
  f: true,
  g: true,
  h: true,
  i: true,
  j: true,
  k: true,
  l: true,
  m: true,
  n: true,
  o: true,
  p: true,
  q: true,
  r: true,
  s: true,
  t: true,
  u: true,
  v: true,
  w: true,
  x: true,
  y: true,
  z: true,
};


export async function getAZList(sortOption, page = 1) {
  const res = {
    sortOption: sortOption.trim(),
    animes: [],
    totalPages: 0,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  page = res.currentPage;
  let originalSortOption = sortOption;
  sortOption = res.sortOption;

  try {
    // Validate sort option
    if (sortOption === '' || !AZ_LIST_SORT_OPTIONS[sortOption]) {
      throw new Error(`Invalid az-list sort option: ${sortOption}`);
    }

    // Transform sort option for URL
    switch (sortOption) {
      case 'all':
        sortOption = '';
        break;
      case 'other':
        sortOption = 'other';
        break;
      default:
        sortOption = sortOption.toUpperCase();
    }

    const azURL = `${SRC_BASE_URL}/az-list/${sortOption}?page=${page}`;

    const { data } = await axios.get(azURL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const selector = '#main-wrapper .tab-content .film_list-wrap .flw-item';

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

    res.sortOption = originalSortOption;

    return res;
  } catch (error) {
    throw new Error(`Failed to scrape AZ list: ${error.message}`);
  }
}
