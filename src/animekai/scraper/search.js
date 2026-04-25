import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiSearchResults = async (q, page = 1) => {
  const { url, $ } = await fetchAnimekaiPage('/browser', {
    keyword: q,
    page,
  });

  return {
    source: url,
    query: q,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
