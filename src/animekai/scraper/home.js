import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const ANIMEKAI_HOME_URL = 'https://anikai.to/home';
const ANIMEKAI_BASE_URL = 'https://anikai.to';

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
  return `${ANIMEKAI_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
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

  $('#featured .swiper.featured .swiper-slide').each((index, el) => {
    const $slide = $(el);
    const href = $slide.find('.watch-btn')?.attr('href')?.trim() || null;
    const miscValues = $slide
      .find('.mics > div')
      .map((_, misc) => {
        const key = $(misc).find('div').first().text().trim().toLowerCase();
        const value = $(misc).find('span').first().text().trim() || null;
        return { key, value };
      })
      .get();

    const rating = miscValues.find((item) => item.key === 'rating')?.value || null;
    const releaseYear = parseNumber(
      miscValues.find((item) => item.key === 'release')?.value || ''
    );
    const quality = miscValues.find((item) => item.key === 'quality')?.value || null;

    featured.push({
      rank: index + 1,
      id: getWatchId(href),
      title: $slide.find('.title')?.first()?.text()?.trim() || null,
      jname: $slide.find('.title')?.first()?.attr('data-jp')?.trim() || null,
      description: $slide.find('.desc')?.text()?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster: $slide.attr('style')?.match(/url\(([^)]+)\)/)?.[1] || null,
      genres:
        $slide
          .find('.info span')
          .last()
          .text()
          .split(',')
          .map((genre) => genre.trim())
          .filter(Boolean) || [],
      episodes: {
        sub: parseNumber($slide.find('.info .sub')?.text()?.trim() || ''),
        dub: parseNumber($slide.find('.info .dub')?.text()?.trim() || ''),
      },
      type: $slide.find('.info span b')?.first()?.text()?.trim() || null,
      rating,
      releaseYear,
      quality,
    });
  });

  return featured;
};

const extractLatestUpdates = ($) => {
  const latestUpdates = [];

  $('#latest-updates .aitem-wrapper.regular .aitem .inner').each((_, el) => {
    const $inner = $(el);
    const href = $inner.find('a.poster')?.attr('href')?.trim() || null;

    latestUpdates.push({
      id: getWatchId(href),
      title: $inner.find('a.title')?.text()?.trim() || null,
      jname: $inner.find('a.title')?.attr('data-jp')?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $inner.find('a.poster img')?.attr('data-src')?.trim() ||
        $inner.find('a.poster img')?.attr('src')?.trim() ||
        null,
      episodes: {
        sub: parseNumber($inner.find('.info .sub')?.text()?.trim() || ''),
        dub: parseNumber($inner.find('.info .dub')?.text()?.trim() || ''),
        total: parseNumber($inner.find('.info b')?.first()?.text()?.trim() || ''),
        type: $inner.find('.info b')?.last()?.text()?.trim() || null,
      },
    });
  });

  return latestUpdates;
};

const extractQuickLists = ($) => {
  const quickLists = {
    newReleases: [],
    upcoming: [],
    completed: [],
  };

  $('.alist-group .swiper-wrapper section').each((_, section) => {
    const $section = $(section);
    const sectionTitle = $section.find('.stitle').first().text().trim().toLowerCase();

    let key = null;
    if (sectionTitle === 'new releases') key = 'newReleases';
    if (sectionTitle === 'upcoming') key = 'upcoming';
    if (sectionTitle === 'completed') key = 'completed';
    if (!key) return;

    $section.find('.aitem-wrapper .aitem').each((_, item) => {
      quickLists[key].push(extractWatchCard($, item));
    });
  });

  return quickLists;
};

const extractTopTrending = ($) => {
  const topTrending = {
    now: [],
    day: [],
    week: [],
    month: [],
  };

  const tabIdToKey = {
    trending: 'now',
    day: 'day',
    week: 'week',
    month: 'month',
  };

  $('#trending-anime .tab-body').each((_, tab) => {
    const $tab = $(tab);
    const tabId = $tab.attr('data-id')?.trim();
    const key = tabIdToKey[tabId];
    if (!key) return;

    $tab.find('.aitem').each((_, item) => {
      const $item = $(item);
      const href = $item.attr('href')?.trim() || null;
      const stylePoster = $item.attr('style')?.match(/url\(([^)]+)\)/)?.[1] || null;

      topTrending[key].push({
        rank: parseNumber($item.find('.num')?.text()?.trim() || ''),
        id: getWatchId(href),
        title: $item.find('.detail .title')?.text()?.trim() || null,
        jname: $item.find('.detail .title')?.attr('data-jp')?.trim() || null,
        href,
        watchUrl: toAbsoluteUrl(href),
        poster: stylePoster,
        episodes: {
          sub: parseNumber($item.find('.info .sub')?.text()?.trim() || ''),
          dub: parseNumber($item.find('.info .dub')?.text()?.trim() || ''),
        },
        type: $item.find('.info b')?.last()?.text()?.trim() || null,
      });
    });
  });

  return topTrending;
};

export async function getAnimekaiHomePage() {
  try {
    const { data } = await axios.get(ANIMEKAI_HOME_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: ANIMEKAI_BASE_URL,
      },
    });

    const $ = load(data);

    return {
      source: ANIMEKAI_HOME_URL,
      featuredAnimes: extractFeaturedAnimes($),
      latestUpdates: {
        all: extractLatestUpdates($),
      },
      quickLists: extractQuickLists($),
      topTrending: extractTopTrending($),
    };
  } catch (error) {
    throw new Error(`Failed to scrape AnimeKai home page: ${error.message}`);
  }
}
