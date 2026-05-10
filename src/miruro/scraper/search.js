import { axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

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
});

export async function searchMiruroAnime(
  search,
  sort = 'POPULARITY_DESC',
  page = 1,
  perPage = 20,
  type = 'ANIME',
  genre = null,
  genres = [],
  format = null,
  status = null,
  season = null,
  year = null,
  startYear = null,
  endYear = null,
  tags = []
) {
  const sortMap = {
    'POPULARITY_DESC': 'POPULARITY_DESC',
    'SCORE_DESC': 'SCORE_DESC',
    'START_DATE_DESC': 'START_DATE_DESC',
    'END_DATE_DESC': 'END_DATE_DESC',
    'UPDATED_AT_DESC': 'UPDATED_AT_DESC',
    'FAVOURITES_DESC': 'FAVOURITES_DESC',
    'TRENDING_DESC': 'TRENDING_DESC',
  };

  const anilistSort = sortMap[sort] || 'POPULARITY_DESC';

  // Build genres array
  const genresIn = [];
  if (genre) genresIn.push(genre);
  if (genres && Array.isArray(genres)) genresIn.push(...genres);
  if (genres && typeof genres === 'string') genresIn.push(genres);

  // Build tags array
  const tagsIn = [];
  if (tags && Array.isArray(tags)) tagsIn.push(...tags);
  if (tags && typeof tags === 'string') tagsIn.push(tags);

  // Calculate year range for fuzzy date
  let startDateGreater, startDateLesser;
  if (startYear || endYear) {
    const sYear = startYear ? parseInt(startYear, 10) : 1900;
    const eYear = endYear ? parseInt(endYear, 10) : 2100;
    startDateGreater = sYear * 10000 + 1 * 100 + 1; // YYYYMMDD format
    startDateLesser = eYear * 10000 + 12 * 100 + 31;
  } else if (year) {
    const y = parseInt(year, 10);
    startDateGreater = y * 10000 + 1 * 100 + 1;
    startDateLesser = y * 10000 + 12 * 100 + 31;
  }

  // Build query dynamically based on provided filters
  const mediaArgs = [];
  const varDefs = [];
  const varValues = {};

  mediaArgs.push('type: ANIME');
  if (search) {
    varDefs.push('$search: String');
    varValues.search = search;
    mediaArgs.push('search: $search');
  }
  varDefs.push('$sort: [MediaSort]');
  varValues.sort = [anilistSort];
  mediaArgs.push('sort: $sort');

  if (genresIn.length > 0) {
    varDefs.push('$genresIn: [String]');
    varValues.genresIn = genresIn;
    mediaArgs.push('genre_in: $genresIn');
  }
  if (tagsIn.length > 0) {
    varDefs.push('$tagsIn: [String]');
    varValues.tagsIn = tagsIn;
    mediaArgs.push('tag_in: $tagsIn');
  }
  if (format) {
    varDefs.push('$format: MediaFormat');
    varValues.format = format;
    mediaArgs.push('format: $format');
  }
  if (status) {
    varDefs.push('$status: MediaStatus');
    varValues.status = status;
    mediaArgs.push('status: $status');
  }
  if (season) {
    varDefs.push('$season: MediaSeason');
    varValues.season = season;
    mediaArgs.push('season: $season');
  }
  if (year || startYear) {
    varDefs.push('$year: Int');
    varValues.year = parseInt(year || startYear, 10);
    mediaArgs.push('seasonYear: $year');
  }
  if (startDateGreater && startDateLesser) {
    varDefs.push('$startDateGreater: FuzzyDateInt');
    varDefs.push('$startDateLesser: FuzzyDateInt');
    varValues.startDateGreater = startDateGreater;
    varValues.startDateLesser = startDateLesser;
    mediaArgs.push('startDate_greater: $startDateGreater');
    mediaArgs.push('startDate_lesser: $startDateLesser');
  }

  const query = `
    query (${varDefs.join(', ')}) {
      Page(page: ${page}, perPage: ${perPage}) {
        pageInfo {
          total
          perPage
          currentPage
          lastPage
          hasNextPage
        }
        media(${mediaArgs.join(', ')}) {
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
          tags { name }
          startDate { year month day }
          endDate { year month day }
        }
      }
    }
  `;

  const data = await anilistQuery(query, varValues);

  return {
    results: data?.Page?.media?.map(formatAniListAnime) || [],
    pagination: {
      total: data?.Page?.pageInfo?.total || 0,
      perPage: data?.Page?.pageInfo?.perPage || perPage,
      currentPage: data?.Page?.pageInfo?.currentPage || page,
      lastPage: data?.Page?.pageInfo?.lastPage || 1,
      hasNextPage: data?.Page?.pageInfo?.hasNextPage || false,
    },
  };
}
