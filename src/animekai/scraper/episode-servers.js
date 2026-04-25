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

const parseCountFromInfo = ($, selector) => {
  const text = $(selector).first().text().trim();
  const match = text.match(/\d+/);
  return match ? Number(match[0]) : 0;
};

export const getAnimekaiEpisodeServers = async ({ animeEpisodeId, ep }) => {
  const animeId = normalizeAnimeId(animeEpisodeId);

  if (!animeId) {
    throw new Error('animeEpisodeId query parameter is required');
  }

  const episodeNumber = parseEpisodeNumber(animeEpisodeId, ep);
  const { url, $ } = await fetchAnimekaiPage(`/watch/${animeId}`, { ep: episodeNumber });

  const title = $('.watch-section .main-entity .title').first().text().trim() || null;
  const subCount = parseCountFromInfo($, '.watch-section .main-entity .info .sub');
  const dubCount = parseCountFromInfo($, '.watch-section .main-entity .info .dub');

  const hasSub = episodeNumber <= subCount;
  const hasDub = episodeNumber <= dubCount;

  const makeServer = (category, rank) => ({
    serverName: `Server ${rank}`,
    serverId: `${animeId}:${episodeNumber}:${category}:server-${rank}`,
    category,
    note: 'Fallback server entry generated from watch-page metadata',
  });

  const subServers = hasSub ? [makeServer('sub', 1), makeServer('sub', 2)] : [];
  const softSubServers = hasSub ? [makeServer('softsub', 1), makeServer('softsub', 2)] : [];
  const dubServers = hasDub ? [makeServer('dub', 1), makeServer('dub', 2)] : [];

  return {
    source: url,
    animeId,
    title,
    episode: episodeNumber,
    categories: {
      sub: subServers,
      softsub: softSubServers,
      dub: dubServers,
    },
    note:
      'AnimeKai protects direct server-list ajax with dynamic request signatures. This response is a structured fallback derived from the watch page and episode counts.',
  };
};
