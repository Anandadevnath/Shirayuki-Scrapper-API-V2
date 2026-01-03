import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
const SRC_SEARCH_URL = `${SRC_BASE_URL}/search`;

const SEARCH_PAGE_FILTERS = {
  GENRES_ID_MAP: {
    action: 1,
    adventure: 2,
    cars: 3,
    comedy: 4,
    dementia: 5,
    demons: 6,
    drama: 8,
    ecchi: 9,
    fantasy: 10,
    game: 11,
    harem: 35,
    historical: 13,
    horror: 14,
    isekai: 44,
    josei: 43,
    kids: 15,
    magic: 16,
    'martial-arts': 17,
    mecha: 18,
    military: 38,
    music: 19,
    mystery: 7,
    parody: 20,
    police: 39,
    psychological: 40,
    romance: 22,
    samurai: 21,
    school: 23,
    'sci-fi': 24,
    seinen: 42,
    shoujo: 25,
    'shoujo-ai': 26,
    shounen: 27,
    'shounen-ai': 28,
    'slice-of-life': 36,
    space: 29,
    sports: 30,
    'super-power': 31,
    supernatural: 37,
    thriller: 41,
    vampire: 32,
  },
  TYPE_ID_MAP: {
    all: 0,
    movie: 1,
    tv: 2,
    ova: 3,
    ona: 4,
    special: 5,
    music: 6,
  },
  STATUS_ID_MAP: {
    all: 0,
    'finished-airing': 1,
    'currently-airing': 2,
    'not-yet-aired': 3,
  },
  RATED_ID_MAP: {
    all: 0,
    g: 1,
    pg: 2,
    'pg-13': 3,
    r: 4,
    'r+': 5,
    rx: 6,
  },
  SCORE_ID_MAP: {
    all: 0,
    appalling: 1,
    horrible: 2,
    'very-bad': 3,
    bad: 4,
    average: 5,
    fine: 6,
    good: 7,
    'very-good': 8,
    great: 9,
    masterpiece: 10,
  },
  SEASON_ID_MAP: {
    all: 0,
    spring: 1,
    summer: 2,
    fall: 3,
    winter: 4,
  },
  LANGUAGE_ID_MAP: {
    all: 0,
    sub: 1,
    dub: 2,
    'sub-&-dub': 3,
  },
  SORT_ID_MAP: {
    default: 'default',
    'recently-added': 'recently_added',
    'recently-updated': 'recently_updated',
    score: 'score',
    'name-a-z': 'name_az',
    'released-date': 'released_date',
    'most-watched': 'most_watched',
  },
};

function getGenresFilterVal(genreNames) {
  if (genreNames.length < 1) {
    return undefined;
  }
  return genreNames
    .map((name) => SEARCH_PAGE_FILTERS.GENRES_ID_MAP[name])
    .filter((id) => id !== undefined)
    .join(',');
}

function getSearchFilterValue(key, rawValue) {
  rawValue = rawValue.trim();
  if (!rawValue) return undefined;

  switch (key) {
    case 'genres': {
      return getGenresFilterVal(rawValue.split(','));
    }
    case 'type': {
      const val = SEARCH_PAGE_FILTERS.TYPE_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'status': {
      const val = SEARCH_PAGE_FILTERS.STATUS_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'rated': {
      const val = SEARCH_PAGE_FILTERS.RATED_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'score': {
      const val = SEARCH_PAGE_FILTERS.SCORE_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'season': {
      const val = SEARCH_PAGE_FILTERS.SEASON_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'language': {
      const val = SEARCH_PAGE_FILTERS.LANGUAGE_ID_MAP[rawValue] ?? 0;
      return val === 0 ? undefined : `${val}`;
    }
    case 'sort': {
      return SEARCH_PAGE_FILTERS.SORT_ID_MAP[rawValue] ?? undefined;
    }
    default:
      return undefined;
  }
}

function getSearchDateFilterValue(isStartDate, rawValue) {
  rawValue = rawValue.trim();
  if (!rawValue) return undefined;

  const dateRegex = /^\d{4}-([0-9]|1[0-2])-([0-9]|[12][0-9]|3[01])$/;
  const dateCategory = isStartDate ? 's' : 'e';
  const [year, month, date] = rawValue.split('-');

  if (!dateRegex.test(rawValue)) {
    return undefined;
  }

  // sample return -> [sy=2023, sm=10, sd=11]
  return [
    Number(year) > 0 ? `${dateCategory}y=${year}` : '',
    Number(month) > 0 ? `${dateCategory}m=${month}` : '',
    Number(date) > 0 ? `${dateCategory}d=${date}` : '',
  ].filter((d) => Boolean(d));
}

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

export async function getAnimeSearchResultsAdvanced(q, page = 1, filters = {}) {
  const res = {
    animes: [],
    mostPopularAnimes: [],
    searchQuery: q,
    searchFilters: {},
    totalPages: 0,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  try {
    q = q.trim() ? decodeURIComponent(q.trim()) : '';
    
    if (q.trim() === '') {
      throw new Error('Invalid search query');
    }

    page = res.currentPage;

    // Parse filters
    const searchFilters = {
      filter: true,
      type: true,
      status: true,
      rated: true,
      score: true,
      season: true,
      language: true,
      start_date: true,
      end_date: true,
      sort: true,
      genres: true,
    };

    const parsedFilters = {};
    for (const key in filters) {
      if (searchFilters[key]) {
        parsedFilters[key] = filters[key];
      }
    }

    res.searchFilters = parsedFilters;

    const url = new URL(SRC_SEARCH_URL);
    url.searchParams.set('keyword', q);
    url.searchParams.set('page', `${page}`);
    url.searchParams.set('sort', 'default');

    // Apply filters
    for (const key in parsedFilters) {
      if (key.includes('_date')) {
        const dates = getSearchDateFilterValue(
          key === 'start_date',
          parsedFilters[key] || ''
        );
        if (!dates) continue;

        dates.map((dateParam) => {
          const [paramKey, val] = dateParam.split('=');
          url.searchParams.set(paramKey, val);
        });
        continue;
      }

      const filterVal = getSearchFilterValue(key, parsedFilters[key] || '');
      filterVal && url.searchParams.set(key, filterVal);
    }

    const { data } = await axios.get(url.href, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const selector = '#main-content .tab-content .film_list-wrap .flw-item';

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

    // Most popular animes
    const mostPopularSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.mostPopularAnimes = extractMostPopularAnimes($, mostPopularSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to search anime: ${error.message}`);
  }
}
