import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiSearchResultsAdvanced = async (q, page = 1, filters = {}) => {
  const searchParams = {
    keyword: q,
    page,
    ...filters,
  };

  const { url, $ } = await fetchAnimekaiPage('/browser', searchParams);

  return {
    source: url,
    query: q,
    page,
    filters,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
