import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

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

const extractAnimes = ($, selector) => {
  const animes = [];
  
  $(selector).each((_, el) => {
    const animeId = $(el)
      .find('.film-detail .film-name .dynamic-name')
      ?.attr('href')
      ?.slice(1)
      .split('?ref=search')[0] || null;

    animes.push({
      id: animeId,
      name: $(el)
        .find('.film-detail .film-name .dynamic-name')
        ?.text()
        ?.trim(),
      jname: $(el)
        .find('.film-detail .film-name .dynamic-name')
        ?.attr('data-jname')
        ?.trim() || null,
      poster: $(el)
        .find('.film-poster .film-poster-img')
        ?.attr('data-src')
        ?.trim() || null,
      duration: $(el)
        .find('.film-detail .fd-infor .fdi-item.fdi-duration')
        ?.text()
        ?.trim(),
      type: $(el)
        .find('.film-detail .fd-infor .fdi-item:nth-of-type(1)')
        ?.text()
        ?.trim(),
      rating: $(el).find('.film-poster .tick-rate')?.text()?.trim() || null,
      episodes: {
        sub: Number(
          $(el)
            .find('.film-poster .tick-sub')
            ?.text()
            ?.trim()
            .split(' ')
            .pop()
        ) || null,
        dub: Number(
          $(el)
            .find('.film-poster .tick-dub')
            ?.text()
            ?.trim()
            .split(' ')
            .pop()
        ) || null,
      },
    });
  });

  return animes;
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
