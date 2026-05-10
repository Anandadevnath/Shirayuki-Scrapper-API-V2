import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeSearchResults = async (q, page = 1) => {
  const { url, $ } = await fetchHiAnimePage('/search', {
    keyword: q,
    page,
  });

  return {
    source: url,
    query: q,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
  };
};
