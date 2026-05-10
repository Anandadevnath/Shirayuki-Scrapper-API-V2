import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const HIANIME_HOME_URL = 'https://hianime.ac/home-hianime';
const HIANIME_BASE_URL = 'https://hianime.ac';


const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const getWatchId = (href) => {
  if (!href) return null;

  const cleanHref = href.split('#')[0].split('?')[0].trim();
  const watchPrefix = '/watch/';

  if (!cleanHref.startsWith(watchPrefix)) {
    return cleanHref.replace(/^\//, '') || null;
  }

  return cleanHref.slice(watchPrefix.length) || null;
};

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${HIANIME_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const getCardPoster = ($card) =>
  $card.find('img')?.attr('data-src')?.trim() ||
  $card.find('img')?.attr('src')?.trim() ||
  null;

const extractCardInfo = ($card) => {
  const sub = parseNumber($card.find('.info .sub')?.text()?.trim() || '');
  const dub = parseNumber($card.find('.info .dub')?.text()?.trim() || '');
  const bTexts = $card
    .find('.info b')
    .map((_, el) => $card.find(el).text().trim())
    .get()
    .filter(Boolean);

  const type = bTexts.find((item) => /[A-Za-z]/.test(item)) || null;
  const totalEpisodes = bTexts.find((item) => /^\d+$/.test(item)) || null;

  return {
    sub,
    dub,
    total: totalEpisodes ? Number(totalEpisodes) : null,
    type,
  };
};

const extractWatchCard = ($, element) => {
  const $card = $(element);
  const href = $card.attr('href')?.trim() || $card.find('a.poster')?.attr('href')?.trim() || null;

  return {
    id: getWatchId(href),
    title:
      $card.find('.title')?.text()?.trim() ||
      $card.find('.title')?.attr('title')?.trim() ||
      $card.attr('title')?.trim() ||
      null,
    jname: $card.find('.title')?.attr('data-jp')?.trim() || null,
    href,
    watchUrl: toAbsoluteUrl(href),
    poster: getCardPoster($card),
    episodes: extractCardInfo($card),
  };
};

const extractFeaturedAnimes = ($) => {
  const featured = [];

  $('.swiper-wrapper .swiper-slide .deslide-item').each((index, el) => {
    const $item = $(el);
    const detailHref = $item.find('.desi-buttons a.btn-secondary')?.attr('href')?.trim() || null;
    const watchHref = $item.find('.desi-buttons a.btn-primary')?.attr('href')?.trim() || null;
    const href = detailHref || watchHref;

    featured.push({
      rank: index + 1,
      id: getWatchId(href),
      title: $item.find('.desi-head-title')?.text()?.trim() || null,
      jname: $item.find('.desi-head-title')?.attr('data-jname')?.trim() || null,
      description: $item.find('.desi-description')?.text()?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $item.find('.deslide-cover-img img')?.attr('data-src')?.trim() ||
        $item.find('.deslide-cover-img img')?.attr('src')?.trim() ||
        null,
      episodes: {
        sub: parseNumber($item.find('.tick-item.tick-sub')?.text()?.trim() || ''),
        dub: parseNumber($item.find('.tick-item.tick-dub')?.text()?.trim() || ''),
      },
      type: $item.find('.scd-item a')?.first()?.text()?.trim() || null,
    });
  });

  return featured;
};

const extractLatestUpdates = ($, $content) => {
  const latestUpdates = [];

  $content.find('.flw-item').each((_, el) => {
    const $item = $(el);
    const href = $item.find('a.film-poster-ahref')?.attr('href')?.trim() ||
      $item.find('.film-name a')?.attr('href')?.trim() ||
      null;

    latestUpdates.push({
      id: getWatchId(href),
      title: $item.find('.film-name a')?.text()?.trim() || null,
      jname: $item.find('.film-name a')?.attr('data-jname')?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $item.find('img.film-poster-img')?.attr('data-src')?.trim() ||
        $item.find('img.film-poster-img')?.attr('src')?.trim() ||
        null,
      episodes: {
        sub: parseNumber($item.find('.tick-item.tick-sub')?.text()?.trim() || ''),
        dub: parseNumber($item.find('.tick-item.tick-dub')?.text()?.trim() || ''),
        total: null,
        type: $item.find('.fd-infor .fdi-item a')?.first()?.text()?.trim() || null,
      },
    });
  });

  return latestUpdates;
};

const extractQuickLists = ($, sections) => {
  return {
    newReleases: sections.newOn?.length ? extractLatestUpdates($, sections.newOn) : [],
    upcoming: sections.hot?.length ? extractLatestUpdates($, sections.hot) : [],
    completed: [],
  };
};

const extractTrendingCarousel = ($) => {
  const items = [];

  $('.block_area_trending .trending-list .swiper-slide .item').each((_, el) => {
    const $item = $(el);
    const href = $item.find('a.film-poster')?.attr('href')?.trim() || null;

    items.push({
      rank: parseNumber($item.find('.number span')?.text()?.trim() || ''),
      id: getWatchId(href),
      title: $item.find('.film-title')?.text()?.trim() || null,
      jname: $item.find('.film-title')?.attr('data-jname')?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $item.find('img.film-poster-img')?.attr('data-src')?.trim() ||
        $item.find('img.film-poster-img')?.attr('src')?.trim() ||
        null,
      episodes: {
        sub: null,
        dub: null,
      },
      type: null,
    });
  });

  return items;
};

const extractTop10Tab = ($, $tab) => {
  const items = [];

  $tab.find('li').each((_, el) => {
    const $item = $(el);
    const href = $item.find('.film-name a')?.attr('href')?.trim() || null;

    items.push({
      rank: parseNumber($item.find('.film-number span')?.text()?.trim() || ''),
      id: getWatchId(href),
      title: $item.find('.film-name a')?.text()?.trim() || null,
      jname: $item.find('.film-name a')?.attr('data-jname')?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $item.find('img.film-poster-img')?.attr('data-src')?.trim() ||
        $item.find('img.film-poster-img')?.attr('src')?.trim() ||
        null,
      episodes: {
        sub: parseNumber($item.find('.tick-item.tick-sub')?.text()?.trim() || ''),
        dub: parseNumber($item.find('.tick-item.tick-dub')?.text()?.trim() || ''),
      },
      type: $item.find('.fd-infor .tick a')?.first()?.text()?.trim() || null,
    });
  });

  return items;
};

const extractTopTrending = ($, $top10Block) => {
  const topTrending = {
    now: extractTrendingCarousel($),
    day: [],
    week: [],
    month: [],
  };

  if (!$top10Block?.length) return topTrending;

  const $day = $top10Block.find('#top-viewed-day');
  const $week = $top10Block.find('#top-viewed-week');
  const $month = $top10Block.find('#top-viewed-month');

  if ($day.length) topTrending.day = extractTop10Tab($, $day);
  if ($week.length) topTrending.week = extractTop10Tab($, $week);
  if ($month.length) topTrending.month = extractTop10Tab($, $month);

  return topTrending;
};

const findSectionContent = ($, headingText) => {
  const $heading = $('h2.cat-heading')
    .filter((_, el) => $(el).text().trim().toLowerCase() === headingText)
    .first();

  if (!$heading.length) return $([]);

  let $block = $heading.closest('.block_area');
  if (!$block.length) {
    $block = $heading.closest('.block_area-header').parent();
  }

  const $content = $block.find('.block_area-content').first();
  return $content.length ? $content : $block;
};

export async function getHiAnimeHomePage() {
  try {
    const { data } = await axios.get(HIANIME_HOME_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: HIANIME_BASE_URL,
      },
    });

    const $ = load(data);
    const latestContent = findSectionContent($, 'latest episode');
    const newOnContent = findSectionContent($, 'new on hianime');
    const hotContent = findSectionContent($, 'new & hot anime');
    const top10Content = findSectionContent($, 'top 10');

    return {
      source: HIANIME_HOME_URL,
      featuredAnimes: extractFeaturedAnimes($),
      latestUpdates: {
        all: latestContent.length ? extractLatestUpdates($, latestContent) : [],
      },
      quickLists: extractQuickLists($, {
        newOn: newOnContent,
        hot: hotContent,
      }),
      topTrending: extractTopTrending($, top10Content),
    };
  } catch (error) {
    throw new Error(`Failed to scrape HiAnime home page: ${error.message}`);
  }
}
