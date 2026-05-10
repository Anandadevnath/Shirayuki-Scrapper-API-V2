import { axios } from '../../utils/scrapper-deps.js';
import { USER_AGENT } from '../../utils/constants.js';

const ANILIST_API_URL = 'https://graphql.anilist.co';
const MIRURO_BASE_URL = 'https://www.miruro.tv';

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
  studios: media.studios?.nodes?.map(s => s.name) || [],
  source: media.source || null,
  synonyms: media.synonyms || [],
  trailer: media.trailer?.id ? {
    id: media.trailer.id,
    site: media.trailer.site,
  } : null,
  watchUrl: media.id ? `${MIRURO_BASE_URL}/info/${media.id}/${media.title?.english?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || media.title?.romaji?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : null,
});

export async function getMiruroAnimeDetails(animeId) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
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
        studios { nodes { name } }
        source
        synonyms
        trailer { id site }
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji }
              coverImage { medium }
              format
            }
          }
        }
        recommendations {
          nodes {
            mediaRecommendation {
              id
              title { english romaji }
              coverImage { medium }
              averageScore
            }
          }
        }
      }
    }
  `;

  const data = await anilistQuery(query, { id: parseInt(animeId, 10) });
  const media = data?.Media;

  if (!media) {
    throw new Error('Anime not found');
  }

  return {
    anime: formatAniListAnime(media),
    relations: media.relations?.edges?.map(edge => ({
      relationType: edge.relationType,
      anime: {
        id: edge.node.id?.toString(),
        title: edge.node.title?.english || edge.node.title?.romaji,
        poster: edge.node.coverImage?.medium,
        format: edge.node.format,
      },
    })) || [],
    recommendations: media.recommendations?.nodes?.map(rec => ({
      id: rec.mediaRecommendation?.id?.toString(),
      title: rec.mediaRecommendation?.title?.english || rec.mediaRecommendation?.title?.romaji,
      poster: rec.mediaRecommendation?.coverImage?.medium,
      rating: rec.mediaRecommendation?.averageScore,
    })).filter(Boolean) || [],
  };
}
