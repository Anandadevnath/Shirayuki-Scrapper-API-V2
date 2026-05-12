import { fetchHianimeePage } from './_shared.js';

const HIANIME_HOME_URL = '/home';
const HIANIME_BASE_URL = 'https://hianime.ws';

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${HIANIME_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const extractFlwItem = ($item) => {
  const href = $item.find('a[href*="/watch/"]').first().attr('href') || null;
  const title = $item
    .find('.film-name a, .film-name, .film-detail h3, .film-title')
    .first()
    .text()
    .trim();
  const poster =
    $item.find('.film-poster-img').attr('data-src') ||
    $item.find('.film-poster-img').attr('src') ||
    $item.find('img').attr('data-src') ||
    $item.find('img').attr('src') ||
    null;

  if (!href || !title) return null;

  return {
    id: href.replace('/watch/', ''),
    title,
    poster,
    href,
    watchUrl: toAbsoluteUrl(href),
    sub: parseNumber($item.find('.tick-sub')?.text()),
    dub: parseNumber($item.find('.tick-dub')?.text()),
    quality: $item.find('.tick-quality')?.text()?.trim() || null,
    type: $item.find('.fd-infor .dot')?.next()?.text()?.trim() || null,
  };
};

const extractFlwItemsFromContainer = ($, $container) => {
  const items = [];
  $container.find('.flw-item').each((_, el) => {
    const item = extractFlwItem($(el));
    if (item) items.push(item);
  });
  return items;
};

const extractAnifBlockList = ($, headerText) => {
  const header = $('.anif-block-header')
    .filter((_, el) => $(el).text().trim() === headerText)
    .first();

  if (!header.length) return [];

  const block = header.closest('.anif-block');
  const items = [];

  block.find('.anif-block-ul li').each((_, el) => {
    const $item = $(el);
    const href = $item.find('a[href*="/watch/"]').first().attr('href') || null;
    const title = $item.find('.film-name a, .film-name').first().text().trim();
    const poster =
      $item.find('.film-poster-img').attr('data-src') ||
      $item.find('.film-poster-img').attr('src') ||
      null;

    if (!href || !title) return;

    items.push({
      id: href.replace('/watch/', ''),
      title,
      poster,
      href,
      watchUrl: toAbsoluteUrl(href),
      sub: parseNumber($item.find('.tick-sub')?.text()),
      dub: parseNumber($item.find('.tick-dub')?.text()),
      quality: $item.find('.tick-quality')?.text()?.trim() || null,
      type: $item.find('.fd-infor .dot')?.next()?.text()?.trim() || null,
    });
  });

  return items;
};

const extractTrending = ($) => {
  const trending = [];

  $('#trending-home .swiper-slide .item').each((_, el) => {
    const $item = $(el);
    const href = $item.find('a.film-poster').attr('href') || null;
    const title = $item.find('.film-title').text().trim();
    const poster =
      $item.find('.film-poster-img').attr('data-src') ||
      $item.find('.film-poster-img').attr('src') ||
      null;
    const rank = parseNumber($item.find('.number span')?.text());

    if (!href || !title) return;

    trending.push({
      rank: rank || trending.length + 1,
      id: href.replace('/watch/', ''),
      title,
      poster,
      href,
      watchUrl: toAbsoluteUrl(href),
    });
  });

  return trending;
};

const extractLatestUpdates = ($) => {
  const latestHeading = $('.cat-heading')
    .filter((_, el) => $(el).text().trim() === 'Latest Updates')
    .first();
  const latestSection = latestHeading.closest('.block_area').length
    ? latestHeading.closest('.block_area')
    : latestHeading.closest('section').length
    ? latestHeading.closest('section')
    : latestHeading.parent();

  if (!latestSection.length) return { all: [], sub: [], dub: [], china: [] };

  const allItems = extractFlwItemsFromContainer($, latestSection);

  return {
    all: allItems,
    sub: [],
    dub: [],
    china: [],
  };
};

const extractMostViewed = ($) => {
  const mostViewedHeading = $('.cat-heading')
    .filter((_, el) => $(el).text().trim() === 'Most Viewed')
    .first();
  const mostViewedSection = mostViewedHeading.closest('.block_area').length
    ? mostViewedHeading.closest('.block_area')
    : mostViewedHeading.closest('section').length
    ? mostViewedHeading.closest('section')
    : mostViewedHeading.parent();

  if (!mostViewedSection.length) return { today: [], week: [], month: [] };

  const extractTabItems = (tabId) => {
    const items = [];
    mostViewedSection.find(`.tab-pane[data-id="${tabId}"] li`).each((_, el) => {
      const $item = $(el);
      const href = $item.find('a[href*="/watch/"]').first().attr('href') || null;
      const title = $item.find('.film-name a, .film-name').first().text().trim();
      const poster =
        $item.find('.film-poster-img').attr('data-src') ||
        $item.find('.film-poster-img').attr('src') ||
        null;
      const rank = parseNumber($item.find('.film-number span')?.text());

      if (!href || !title) return;

      items.push({
        rank: rank || items.length + 1,
        id: href.replace('/watch/', ''),
        title,
        poster,
        href,
        watchUrl: toAbsoluteUrl(href),
      });
    });
    return items;
  };

  return {
    today: extractTabItems('day'),
    week: extractTabItems('week'),
    month: extractTabItems('month'),
  };
};

export const getHianimHomePage = async () => {
  try {
    const { $, url } = await fetchHianimeePage(HIANIME_HOME_URL);

    const trending = extractTrending($);
    const latestUpdates = extractLatestUpdates($);
    const mostViewed = extractMostViewed($);

    const newReleases = extractAnifBlockList($, 'New Releases');
    const recentlyAdded = extractAnifBlockList($, 'Recently Added');
    const upcoming = extractAnifBlockList($, 'Upcoming');
    const completed = extractAnifBlockList($, 'Completed');

    return {
      url,
      trending,
      latestUpdates,
      mostViewed,
      newReleases,
      recentlyAdded,
      upcoming,
      completed,
      totalTrending: trending.length,
      totalLatestUpdates: latestUpdates.all.length,
      totalMostViewedToday: mostViewed.today.length,
      totalNewReleases: newReleases.length,
      totalRecentlyAdded: recentlyAdded.length,
      totalUpcoming: upcoming.length,
      totalCompleted: completed.length,
    };
  } catch (error) {
    throw new Error(`Failed to fetch Hianime home page: ${error.message}`);
  }
};
