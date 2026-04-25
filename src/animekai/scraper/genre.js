import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiGenreAnime = async (name, page = 1) => {
  const { url, $ } = await fetchAnimekaiPage(`/genres/${name}`, { page });

  return {
    source: url,
    genre: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
