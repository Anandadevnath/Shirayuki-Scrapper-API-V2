import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const ANIMEKAI_BASE_URL = 'https://anikai.to';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${ANIMEKAI_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const getWatchId = (href) => {
  if (!href) return null;
  const cleanHref = href.split('#')[0].split('?')[0].trim();
  if (cleanHref.startsWith('/watch/')) {
    return cleanHref.slice('/watch/'.length) || null;
  }
  return cleanHref.replace(/^\//, '') || null;
};

export const fetchAnimekaiPage = async (path, searchParams = {}) => {
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
  const url = `${ANIMEKAI_BASE_URL}${path}${queryString ? `?${queryString}` : ''}`;

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: ANIMEKAI_BASE_URL,
    },
  });

  return {
    url,
    $: load(data),
  };
};

export const extractAnimeCards = ($) => {
  const animes = [];

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

export const extractPagination = ($) => {
  const currentPage = parseNumber($('.pagination .page-item.active .page-link').first().text() || '') || 1;
  const lastPageLink = $('.pagination .page-item a[rel="last"]').attr('href') || '';
  const totalPages = parseNumber(lastPageLink) || currentPage;
  const hasNextPage = $('.pagination .page-item a[rel="next"]').length > 0;

  return {
    currentPage,
    totalPages,
    hasNextPage,
  };
};

export const extractCollectionMeta = ($) => {
  const title = $('.shead .stitle').first().text().trim() || null;
  const countText = $('.shead span').last().text().trim() || '';
  const totalItems = parseNumber(countText);

  return {
    title,
    totalItems,
  };
};
