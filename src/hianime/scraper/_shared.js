import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const HIANIME_BASE_URL = 'https://hianime.ws';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${HIANIME_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const getAnimeId = (href) => {
  if (!href) return null;
  const cleanHref = href.split('#')[0].split('?')[0].trim();
  
  // Extract ID from URLs like /watch/attack-on-titan-112
  const watchMatch = cleanHref.match(/\/watch\/([\w-]+)/);
  if (watchMatch) {
    return watchMatch[1];
  }
  
  return cleanHref.replace(/^\//, '') || null;
};

export const fetchHianimeePage = async (path, searchParams = {}) => {
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
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      Referer: HIANIME_BASE_URL,
    },
  });

  return {
    url,
    $: load(data),
  };
};

export const extractAnimeCard = ($, element) => {
  const $card = $(element);
  const href = $card.find('a')?.attr('href')?.trim() || null;
  
  return {
    id: getAnimeId(href),
    title: $card.find('.film-name, .anime-title')?.text()?.trim() || null,
    poster: $card.find('img')?.attr('src')?.trim() || $card.find('img')?.attr('data-src')?.trim() || null,
    href,
    watchUrl: toAbsoluteUrl(href),
  };
};

export const extractAnimeCards = ($, selector = '.film_list-wrap .flw-item, .trending .film-item, .anime-card') => {
  const animes = [];

  $(selector).each((_, el) => {
    const card = extractAnimeCard($, el);
    if (card.id) {
      animes.push(card);
    }
  });

  return animes;
};
