import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiAZList = async (sortOption = 'all', page = 1) => {
  const normalizedSort = sortOption === 'all' ? '' : sortOption;
  const path = `/az-list${normalizedSort ? `/${normalizedSort}` : ''}`;
  const { url, $ } = await fetchAnimekaiPage(path, { page });

  return {
    source: url,
    sortOption,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
