import { fetchAnimekaiPage } from './_shared.js';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const toWatchUrl = (animeId, episodeNumber) => `https://anikai.to/watch/${animeId}#ep=${episodeNumber}`;

export const getAnimekaiEpisodes = async (animeId) => {
  if (!animeId || typeof animeId !== 'string' || animeId.trim() === '') {
    throw new Error('Invalid anime id');
  }

  const { url, $ } = await fetchAnimekaiPage(`/watch/${animeId}`);

  const title = $('.watch-section .main-entity .title').first().text().trim() || null;
  const subTotal = parseNumber($('.watch-section .main-entity .info .sub').first().text().trim() || '') || 0;
  const dubTotal = parseNumber($('.watch-section .main-entity .info .dub').first().text().trim() || '') || 0;
  const totalEpisodes = Math.max(subTotal, dubTotal);

  const episodes = Array.from({ length: totalEpisodes }, (_, index) => {
    const number = index + 1;
    return {
      number,
      title: title ? `${title} Episode ${number}` : `Episode ${number}`,
      episodeId: `${animeId}?ep=${number}`,
      href: `/watch/${animeId}#ep=${number}`,
      watchUrl: toWatchUrl(animeId, number),
      hasSub: number <= subTotal,
      hasDub: number <= dubTotal,
      isFiller: null,
    };
  });

  return {
    source: url,
    animeId,
    title,
    totalEpisodes,
    subTotal,
    dubTotal,
    episodes,
    note:
      'AnimeKai protects ajax episode-list requests with dynamic request signatures. This endpoint returns a generated full list based on the real sub/dub totals from the watch page.',
  };
};
