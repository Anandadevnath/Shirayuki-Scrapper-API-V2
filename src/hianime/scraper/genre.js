import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeGenreAnime = async (name, page = 1) => {
  const { url, $ } = await fetchHiAnimePage(`/genre/${name}`, { page });

  return {
    source: url,
    genre: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
  };
};
