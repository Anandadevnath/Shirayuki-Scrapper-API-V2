import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeCategoryAnime = async (name, page = 1) => {
  const { url, $ } = await fetchHiAnimePage(`/${name}`, { page });

  return {
    source: url,
    category: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
  };
};
