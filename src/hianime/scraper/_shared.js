import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const HIANIME_BASE_URL = 'https://hianime.ac';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${HIANIME_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const getWatchId = (href) => {
  if (!href) return null;
  const cleanHref = href.split('#')[0].split('?')[0].trim();
  if (cleanHref.startsWith('/watch/')) {
    return cleanHref.slice('/watch/'.length) || null;
  }
  return cleanHref.replace(/^\//, '') || null;
};

export const fetchHiAnimePage = async (path, searchParams = {}) => {
  const query = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== '') {
          query.append(key, String(item));
        }
      });
      return;
    }

    query.append(key, String(value));
  });

  const queryString = query.toString();
  const url = `${HIANIME_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: HIANIME_BASE_URL,
    },
  });

  return {
    url,
    $: load(data),
  };
};

export const extractAnimeCards = ($) => {
  const animes = [];

  const flwItems = $('.flw-item');
  if (flwItems.length) {
    flwItems.each((_, el) => {
      const $item = $(el);
      const href =
        $item.find('a.film-poster-ahref')?.attr('href')?.trim() ||
        $item.find('.film-name a')?.attr('href')?.trim() ||
        null;

      animes.push({
        id: getWatchId(href),
        title: $item.find('.film-name a')?.text()?.trim() || null,
        jname: $item.find('.film-name a')?.attr('data-jname')?.trim() || null,
        href,
        watchUrl: toAbsoluteUrl(href),
        poster:
          $item.find('img.film-poster-img')?.attr('data-src')?.trim() ||
          $item.find('img.film-poster-img')?.attr('src')?.trim() ||
          null,
        adult: $item.find('.tags .adult').length > 0,
        episodes: {
          sub: parseNumber($item.find('.tick-item.tick-sub')?.text()?.trim() || ''),
          dub: parseNumber($item.find('.tick-item.tick-dub')?.text()?.trim() || ''),
          total: null,
        },
        type: $item.find('.fd-infor a')?.first()?.text()?.trim() || null,
      });
    });

    return animes;
  }

  $('.aitem-wrapper.regular .aitem .inner').each((_, el) => {
    const $item = $(el);
    const href = $item.find('a.poster')?.attr('href')?.trim() || null;
    const bTexts = $item
      .find('.info b')
      .map((__, b) => $(b).text().trim())
      .get()
      .filter(Boolean);

    animes.push({
      id: getWatchId(href),
      title: $item.find('a.title')?.text()?.trim() || null,
      jname: $item.find('a.title')?.attr('data-jp')?.trim() || null,
      href,
      watchUrl: toAbsoluteUrl(href),
      poster:
        $item.find('a.poster img')?.attr('data-src')?.trim() ||
        $item.find('a.poster img')?.attr('src')?.trim() ||
        null,
      adult: $item.find('.tags .adult').length > 0,
      episodes: {
        sub: parseNumber($item.find('.info .sub')?.text()?.trim() || ''),
        dub: parseNumber($item.find('.info .dub')?.text()?.trim() || ''),
        total: parseNumber(bTexts.find((text) => /^\d+$/.test(text)) || ''),
      },
      type: bTexts.find((text) => /[A-Za-z]/.test(text)) || null,
    });
  });

  return animes;
};

export const extractPagination = ($, currentPageOverride = null) => {
  const activeText =
    $('.pagination .page-item.active .page-link').first().text() ||
    $('.pagination .page-item.active').first().text() ||
    '';
  const currentPage =
    parseNumber(activeText) ||
    (Number.isFinite(currentPageOverride) ? currentPageOverride : 1);

  const pageLinks = $('.pagination a[href*="page="], .pagination-list a[href*="page="], .paging a[href*="page="]');
  const pageNumbers = pageLinks
    .map((_, el) => {
      const href = $(el).attr('href') || '';
      const match = href.match(/[?&]page=(\d+)/i);
      return match ? Number(match[1]) : null;
    })
    .get()
    .filter((n) => Number.isFinite(n));

  const totalPages = pageNumbers.length ? Math.max(...pageNumbers) : currentPage;
  const hasNextPage =
    $('.pagination a[rel="next"]').length > 0 ||
    pageLinks.filter((_, el) => $(el).text().trim() === '›').length > 0 ||
    currentPage < totalPages;

  return {
    currentPage,
    totalPages,
    hasNextPage,
  };
};

export const extractCollectionMeta = ($) => {
  const headingText =
    $('h1').first().text().trim() ||
    $('h2.cat-heading').first().text().trim() ||
    $('.shead .stitle').first().text().trim() ||
    null;

  const countText =
    $('.shead span').last().text().trim() ||
    $('h1').first().text().trim() ||
    '';

  const totalMatch = countText.match(/(\d+)\s+results/i) || countText.match(/(\d+)/);
  const totalItems = totalMatch ? Number(totalMatch[1]) : null;

  return {
    title: headingText || null,
    totalItems,
  };
};
