import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeSearchResultsAdvanced = async (q, page = 1, filters = {}) => {
  const searchParams = {
    keyword: q,
    page,
    ...filters,
  };

  const { url, $ } = await fetchHiAnimePage('/search', searchParams);

  return {
    source: url,
    query: q,
    page,
    filters,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
  };
};
