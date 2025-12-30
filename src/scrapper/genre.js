import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

/**
 * Extract anime items from selector
 */
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

/**
 * Extract most popular anime items
 */
const extractMostPopularAnimes = ($, selector) => {
  const animes = [];

  $(selector).each((_, el) => {
    animes.push({
      id: $(el)
        .find('.film-detail .dynamic-name')
        ?.attr('href')
        ?.slice(1)
        .trim() || null,
      name: $(el).find('.film-detail .dynamic-name')?.text()?.trim() || null,
      jname: $(el)
        .find('.film-detail .film-name .dynamic-name')
        .attr('data-jname')
        ?.trim() || null,
      poster: $(el)
        .find('.film-poster .film-poster-img')
        ?.attr('data-src')
        ?.trim() || null,
      episodes: {
        sub: Number(
          $(el)
            ?.find('.fd-infor .tick .tick-sub')
            ?.text()
            ?.trim()
        ) || null,
        dub: Number(
          $(el)
            ?.find('.fd-infor .tick .tick-dub')
            ?.text()
            ?.trim()
        ) || null,
      },
      type: $(el)
        ?.find('.fd-infor .tick')
        ?.text()
        ?.trim()
        ?.replace(/[\s\n]+/g, ' ')
        ?.split(' ')
        ?.pop() || null,
    });
  });

  return animes;
};

/**
 * Get anime by genre
 */
export async function getGenreAnime(genreName, page = 1) {
  const res = {
    // there's a typo with hianime where "martial" arts is "marial" arts
    genreName: genreName === 'martial-arts' ? 'marial-arts' : genreName.trim(),
    animes: [],
    genres: [],
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  genreName = res.genreName;
  page = res.currentPage;

  try {
    if (genreName === '') {
      throw new Error('Invalid genre name');
    }

    const genreUrl = `${SRC_BASE_URL}/genre/${genreName}?page=${page}`;

    const { data } = await axios.get(genreUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const selector = '#main-content .tab-content .film_list-wrap .flw-item';

    const genreNameSelector = '#main-content .block_area .block_area-header .cat-heading';
    res.genreName = $(genreNameSelector)?.text()?.trim() ?? genreName;

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

    // Genres list
    const genreSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li';
    $(genreSelector).each((_, el) => {
      res.genres.push($(el).text().trim());
    });

    // Top Airing Animes
    const topAiringSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.topAiringAnimes = extractMostPopularAnimes($, topAiringSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to get genre animes: ${error.message}`);
  }
}
