import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeAZList = async (sortOption = 'all', page = 1) => {
  const normalizedSort = sortOption === 'all' ? '' : sortOption;
  const path = `/az-list${normalizedSort ? `/${normalizedSort}` : ''}`;
  const { url, $ } = await fetchHiAnimePage(path, { page });

  return {
    source: url,
    sortOption,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
  };
};
