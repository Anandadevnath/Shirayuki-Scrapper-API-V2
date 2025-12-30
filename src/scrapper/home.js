import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const SRC_HOME_URL = `${SRC_BASE_URL}/home`;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';


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


export async function getHomePage() {
  const res = {
    spotlightAnimes: [],
    trendingAnimes: [],
    latestEpisodeAnimes: [],
    topUpcomingAnimes: [],
    top10Animes: {
      today: [],
      week: [],
      month: [],
    },
    topAiringAnimes: [],
    mostPopularAnimes: [],
    mostFavoriteAnimes: [],
    latestCompletedAnimes: [],
    genres: [],
  };

  try {
    const { data } = await axios.get(SRC_HOME_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    // Spotlight Animes
    const spotlightSelector = '#slider .swiper-wrapper .swiper-slide';
    $(spotlightSelector).each((_, el) => {
      const otherInfo = $(el)
        .find('.deslide-item-content .sc-detail .scd-item')
        .map((_, el) => $(el).text().trim())
        .get()
        .slice(0, -1);

      res.spotlightAnimes.push({
        rank: Number(
          $(el)
            .find('.deslide-item-content .desi-sub-text')
            ?.text()
            .trim()
            .split(' ')[0]
            .slice(1)
        ) || null,
        id: $(el)
          .find('.deslide-item-content .desi-buttons a')
          ?.last()
          ?.attr('href')
          ?.slice(1)
          ?.trim() || null,
        name: $(el)
          .find('.deslide-item-content .desi-head-title.dynamic-name')
          ?.text()
          .trim(),
        description: $(el)
          .find('.deslide-item-content .desi-description')
          ?.text()
          ?.split('[')
          ?.shift()
          ?.trim() || null,
        poster: $(el)
          .find('.deslide-cover .deslide-cover-img .film-poster-img')
          ?.attr('data-src')
          ?.trim() || null,
        jname: $(el)
          .find('.deslide-item-content .desi-head-title.dynamic-name')
          ?.attr('data-jname')
          ?.trim() || null,
        episodes: {
          sub: Number(
            $(el)
              .find('.deslide-item-content .sc-detail .scd-item .tick-item.tick-sub')
              ?.text()
              ?.trim()
          ) || null,
          dub: Number(
            $(el)
              .find('.deslide-item-content .sc-detail .scd-item .tick-item.tick-dub')
              ?.text()
              ?.trim()
          ) || null,
        },
        type: otherInfo?.[0] || null,
        otherInfo,
      });
    });

    // Trending Animes
    const trendingSelector = '#trending-home .swiper-wrapper .swiper-slide';
    $(trendingSelector).each((_, el) => {
      res.trendingAnimes.push({
        rank: parseInt(
          $(el)
            .find('.item .number')
            ?.children()
            ?.first()
            ?.text()
            ?.trim()
        ),
        id: $(el)
          .find('.item .film-poster')
          ?.attr('href')
          ?.slice(1)
          ?.trim() || null,
        name: $(el)
          .find('.item .number .film-title.dynamic-name')
          ?.text()
          ?.trim(),
        jname: $(el)
          .find('.item .number .film-title.dynamic-name')
          ?.attr('data-jname')
          ?.trim() || null,
        poster: $(el)
          .find('.item .film-poster .film-poster-img')
          ?.attr('data-src')
          ?.trim() || null,
      });
    });

    // Latest Episode Animes
    const latestEpisodeSelector = '#main-content .block_area_home:nth-of-type(1) .tab-content .film_list-wrap .flw-item';
    res.latestEpisodeAnimes = extractAnimes($, latestEpisodeSelector);

    // Top Upcoming Animes
    const topUpcomingSelector = '#main-content .block_area_home:nth-of-type(3) .tab-content .film_list-wrap .flw-item';
    res.topUpcomingAnimes = extractAnimes($, topUpcomingSelector);

    // Genres
    const genreSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li';
    $(genreSelector).each((_, el) => {
      res.genres.push($(el).text().trim());
    });

    // Top 10 Animes
    const mostViewedSelector = '#main-sidebar .block_area-realtime [id^="top-viewed-"]';
    $(mostViewedSelector).each((_, el) => {
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

    // Featured Animes
    res.topAiringAnimes = extractMostPopularAnimes(
      $,
      '#anime-featured .row div:nth-of-type(1) .anif-block-ul ul li'
    );
    res.mostPopularAnimes = extractMostPopularAnimes(
      $,
      '#anime-featured .row div:nth-of-type(2) .anif-block-ul ul li'
    );
    res.mostFavoriteAnimes = extractMostPopularAnimes(
      $,
      '#anime-featured .row div:nth-of-type(3) .anif-block-ul ul li'
    );
    res.latestCompletedAnimes = extractMostPopularAnimes(
      $,
      '#anime-featured .row div:nth-of-type(4) .anif-block-ul ul li'
    );

    return res;
  } catch (error) {
    throw new Error(`Failed to scrape home page: ${error.message}`);
  }
}
