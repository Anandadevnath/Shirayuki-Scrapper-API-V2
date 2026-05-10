import { load, axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const MIRURO_HOME_URL = 'https://www.miruro.tv/';
const MIRURO_BASE_URL = 'https://www.miruro.tv';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const getAnimeId = (href) => {
  if (!href) return null;
  // Handle full URLs
  const url = href.replace(/^https?:\/\/[^\/]+/, '');
  const cleanHref = url.split('#')[0].split('?')[0].trim();
  const infoPrefix = '/info/';

  if (cleanHref.startsWith(infoPrefix)) {
    const parts = cleanHref.slice(infoPrefix.length).split('/');
    return parts[0] || null;
  }

  return cleanHref.replace(/^\//, '') || null;
};

const toAbsoluteUrl = (href) => {
  if (!href) return null;
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  return `${MIRURO_BASE_URL}${href.startsWith('/') ? '' : '/'}${href}`;
};

const extractTrendingAnime = ($) => {
  const trending = [];

  // Look for the Trending Anime nav section
  $('nav[aria-label="Trending"] ul li a').each((_, el) => {
    const $link = $(el);
    const href = $link.attr('href')?.trim() || null;
    const title = $link.text()?.trim() || null;

    // Get anime ID from href (e.g., /info/182300/wistoria-wand-and-sword-season-2)
    const id = getAnimeId(href);

    if (id && title) {
      trending.push({
        rank: trending.length + 1,
        id,
        title,
        slug: href?.split('/').pop() || null,
        href,
        watchUrl: toAbsoluteUrl(href),
        poster: null, // SSR page doesn't include poster images
        episodes: {
          sub: null,
          dub: null,
        },
      });
    }
  });

  return trending;
};

const extractFeaturedAnime = ($) => {
  const featured = [];

  // Look for featured/banner anime (usually larger images or hero section)
  $('.hero, .banner, .featured, [class*="hero"], [class*="banner"], [class*="featured"]').each((_, section) => {
    const $section = $(section);

    $section.find('a[href^="/info/"]').each((_, el) => {
      const $card = $(el);
      const href = $card.attr('href')?.trim() || null;
      const id = getAnimeId(href);

      const title =
        $card.find('.title, h1, h2, h3')?.text()?.trim() ||
        $card.attr('title')?.trim() ||
        null;

      const poster =
        $card.find('img')?.attr('data-src')?.trim() ||
        $card.find('img')?.attr('src')?.trim() ||
        $section.find('img')?.attr('data-src')?.trim() ||
        null;

      const description =
        $card.find('.description, .desc, [class*="desc"]')?.text()?.trim() ||
        $section.find('.description, .desc, [class*="desc"]')?.text()?.trim() ||
        null;

      if (id && title) {
        featured.push({
          rank: featured.length + 1,
          id,
          title,
          description,
          href,
          watchUrl: toAbsoluteUrl(href),
          poster,
        });
      }
    });
  });

  return featured.slice(0, 5);
};

const ANILIST_API_URL = 'https://graphql.anilist.co';

const anilistQuery = async (query, variables = {}) => {
  const { data } = await axios.post(
    ANILIST_API_URL,
    { query, variables },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    }
  );
  return data.data;
};

const formatAniListAnime = (media) => ({
  id: media.id?.toString() || null,
  title: media.title?.english || media.title?.romaji || null,
  romaji: media.title?.romaji || null,
  native: media.title?.native || null,
  slug: media.title?.english?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || null,
  poster: media.coverImage?.large || media.coverImage?.medium || null,
  banner: media.bannerImage || null,
  description: media.description || null,
  type: media.format || null,
  status: media.status || null,
  episodes: media.episodes || null,
  duration: media.duration || null,
  rating: media.averageScore || null,
  popularity: media.popularity || null,
  season: media.season || null,
  seasonYear: media.seasonYear || null,
  genres: media.genres || [],
  startDate: media.startDate || null,
  endDate: media.endDate || null,
  watchUrl: media.id ? `${MIRURO_BASE_URL}/info/${media.id}/${media.title?.english?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || media.title?.romaji?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null,
});

export async function getMiruroHomePage() {
  try {
    // Fetch from SSR page
    const { data } = await axios.get(MIRURO_HOME_URL, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Referer: MIRURO_BASE_URL,
      },
    });

    const $ = load(data);

    return {
      source: MIRURO_HOME_URL,
      trending: extractTrendingAnime($),
      featured: extractFeaturedAnime($),
    };
  } catch (error) {
    throw new Error(`Failed to scrape Miruro home page: ${error.message}`);
  }
}

export async function getMiruroNewest(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: START_DATE_DESC, type: ANIME, status_not: NOT_YET_RELEASED) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroPopular(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: POPULARITY_DESC, type: ANIME) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroTopRated(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: SCORE_DESC, type: ANIME) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroTopAiring(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: POPULARITY_DESC, type: ANIME, status: RELEASING) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          nextAiringEpisode { episode timeUntilAiring }
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroUpcoming(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: POPULARITY_DESC, type: ANIME, status: NOT_YET_RELEASED) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroJustFinished(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage, page: 1) {
        media(sort: END_DATE_DESC, type: ANIME, status: FINISHED) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroTopMovies(perPage = 12) {
  const query = `
    query ($perPage: Int) {
      Page(perPerPage: $perPage, page: 1) {
        media(sort: POPULARITY_DESC, type: ANIME, format: MOVIE) {
          id
          title { english romaji native }
          coverImage { large medium }
          bannerImage
          description
          format
          status
          episodes
          duration
          averageScore
          popularity
          season
          seasonYear
          genres
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage });
  return data?.Page?.media?.map(formatAniListAnime) || [];
}

export async function getMiruroAiringSchedule(perPage = 20) {
  const now = Math.floor(Date.now() / 1000);
  const oneWeek = now + 7 * 24 * 60 * 60;

  const query = `
    query ($perPage: Int, $start: Int, $end: Int) {
      Page(perPage: $perPage, page: 1) {
        airingSchedules(airingAt_greater: $start, airingAt_lesser: $end) {
          id
          episode
          airingAt
          media {
            id
            title { english romaji native }
            coverImage { large medium }
            format
            episodes
            duration
            averageScore
            popularity
          }
        }
      }
    }
  `;
  const data = await anilistQuery(query, { perPage, start: now, end: oneWeek });
  return data?.Page?.airingSchedules?.map((schedule) => ({
    id: schedule.id?.toString() || null,
    episode: schedule.episode || null,
    airingAt: schedule.airingAt || null,
    anime: formatAniListAnime(schedule.media),
  })) || [];
}

export async function getMiruroCompleteHome() {
  const [
    home,
    newest,
    popular,
    topRated,
    topAiring,
    upcoming,
    justFinished,
    topMovies,
    airingSchedule,
  ] = await Promise.all([
    getMiruroHomePage().catch(() => ({ trending: [], featured: [] })),
    getMiruroNewest(12).catch(() => []),
    getMiruroPopular(12).catch(() => []),
    getMiruroTopRated(12).catch(() => []),
    getMiruroTopAiring(12).catch(() => []),
    getMiruroUpcoming(12).catch(() => []),
    getMiruroJustFinished(12).catch(() => []),
    getMiruroTopMovies(12).catch(() => []),
    getMiruroAiringSchedule(20).catch(() => []),
  ]);

  return {
    source: MIRURO_BASE_URL,
    ...home,
    sections: {
      newest,
      popular,
      topRated,
      topAiring,
      upcoming,
      justFinished,
      topMovies,
    },
    airingSchedule,
  };
}
