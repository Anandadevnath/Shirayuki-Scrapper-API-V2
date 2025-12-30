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
 * Extract top 10 anime items
 */
const extractTop10Animes = ($, period) => {
  const animes = [];
  const selector = `#top-viewed-${period} ul li`;

  $(selector).each((_, el) => {
    animes.push({
      id: $(el)
        .find('.film-detail .dynamic-name')
        ?.attr('href')
        ?.slice(1)
        .trim() || null,
      rank: Number($(el).find('.film-number span')?.text()?.trim()) || null,
      name: $(el).find('.film-detail .dynamic-name')?.text()?.trim() || null,
      jname: $(el)
        .find('.film-detail .dynamic-name')
        ?.attr('data-jname')
        ?.trim() || null,
      poster: $(el)
        .find('.film-poster .film-poster-img')
        ?.attr('data-src')
        ?.trim() || null,
      episodes: {
        sub: Number(
          $(el)
            .find('.film-detail .fd-infor .tick-item.tick-sub')
            ?.text()
            ?.trim()
        ) || null,
        dub: Number(
          $(el)
            .find('.film-detail .fd-infor .tick-item.tick-dub')
            ?.text()
            ?.trim()
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
 * Get anime by producer
 */
export async function getProducerAnimes(producerName, page = 1) {
  const res = {
    producerName,
    animes: [],
    top10Animes: {
      today: [],
      week: [],
      month: [],
    },
    topAiringAnimes: [],
    totalPages: 0,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  try {
    if (producerName.trim() === '') {
      throw new Error('Invalid producer name');
    }

    page = res.currentPage;

    const producerUrl = `${SRC_BASE_URL}/producer/${producerName}?page=${page}`;

    const { data } = await axios.get(producerUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const animeSelector = '#main-content .tab-content .film_list-wrap .flw-item';

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

    res.animes = extractAnimes($, animeSelector);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    const producerNameSelector = '#main-content .block_area .block_area-header .cat-heading';
    res.producerName = $(producerNameSelector)?.text()?.trim() ?? producerName;

    // Top 10 Animes
    const top10AnimeSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
    $(top10AnimeSelector).each((_, el) => {
      const period = $(el).attr('id')?.split('-')?.pop()?.trim();

      if (period === 'day') {
        res.top10Animes.today = extractTop10Animes($, period);
        return;
      }
      if (period === 'week') {
        res.top10Animes.week = extractTop10Animes($, period);
        return;
      }
      if (period === 'month') {
        res.top10Animes.month = extractTop10Animes($, period);
      }
    });

    // Top Airing Animes
    const topAiringSelector = '#main-sidebar .block_area_sidebar:nth-child(2) .block_area-content .anif-block-ul ul li';
    res.topAiringAnimes = extractMostPopularAnimes($, topAiringSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to get producer animes: ${error.message}`);
  }
}
