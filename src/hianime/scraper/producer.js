import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchHiAnimePage,
} from './_shared.js';

export const getHiAnimeProducerAnime = async (name, page = 1) => {
  const keyword = String(name || '').replace(/-/g, ' ').trim();
  const { url, $ } = await fetchHiAnimePage('/search', {
    keyword,
    page,
  });

  return {
    source: url,
    producer: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($, page),
    animes: extractAnimeCards($),
    note: 'HiAnime does not expose producer listing pages; this endpoint falls back to keyword search.',
  };
};
