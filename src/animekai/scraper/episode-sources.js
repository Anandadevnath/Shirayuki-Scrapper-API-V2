import { fetchAnimekaiPage } from './_shared.js';

const parseEpisodeNumber = (animeEpisodeId, epQuery) => {
  if (epQuery && Number(epQuery) > 0) {
    return Number(epQuery);
  }

  if (!animeEpisodeId) return 1;

  const queryMatch = animeEpisodeId.match(/[?#&]ep=(\d+)/i);
  if (queryMatch) return Number(queryMatch[1]);

  return 1;
};

const normalizeAnimeId = (animeEpisodeId) => {
  if (!animeEpisodeId) return null;

  return animeEpisodeId
    .split('#')[0]
    .split('?')[0]
    .replace(/^\/watch\//, '')
    .trim();
};

const normalizeCategory = (category) => {
  const c = String(category || 'sub').toLowerCase().trim();
  if (c === 'dub' || c === 'softsub' || c === 'sub') return c;
  return 'sub';
};

const normalizeServer = (server) => {
  const s = String(server || 'server-1').toLowerCase().trim();
  if (s === 'server-1' || s === 'server-2') return s;
  return 'server-1';
};

export const getAnimekaiEpisodeSources = async ({ animeEpisodeId, ep, server, category }) => {
  const animeId = normalizeAnimeId(animeEpisodeId);

  if (!animeId) {
    throw new Error('animeEpisodeId query parameter is required');
  }

  const episodeNumber = parseEpisodeNumber(animeEpisodeId, ep);
  const normalizedServer = normalizeServer(server);
  const normalizedCategory = normalizeCategory(category);

  const { url, $ } = await fetchAnimekaiPage(`/watch/${animeId}`, { ep: episodeNumber });
  const title = $('.watch-section .main-entity .title').first().text().trim() || null;

  const watchUrl = `https://anikai.to/watch/${animeId}#ep=${episodeNumber}`;
  const fallbackSource = {
    source: watchUrl,
    type: 'watch-page',
    quality: null,
    referer: 'https://anikai.to/',
    server: normalizedServer,
    category: normalizedCategory,
  };

  return {
    animeId,
    title,
    episode: episodeNumber,
    sourcePage: url,
    sources: [fallbackSource],
    tracks: [],
    intro: null,
    outro: null,
    note:
      'AnimeKai streaming source ajax is protected by dynamic request signatures. This endpoint returns a fallback watch-page source object for the selected episode/server/category.',
  };
};
