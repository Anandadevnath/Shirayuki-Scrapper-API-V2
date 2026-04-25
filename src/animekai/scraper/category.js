import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiCategoryAnime = async (name, page = 1) => {
  const { url, $ } = await fetchAnimekaiPage(`/${name}`, { page });

  return {
    source: url,
    category: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
