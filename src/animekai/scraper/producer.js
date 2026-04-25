import {
  extractAnimeCards,
  extractCollectionMeta,
  extractPagination,
  fetchAnimekaiPage,
} from './_shared.js';

export const getAnimekaiProducerAnime = async (name, page = 1) => {
  const { url, $ } = await fetchAnimekaiPage(`/producers/${name}`, { page });

  return {
    source: url,
    producer: name,
    page,
    ...extractCollectionMeta($),
    ...extractPagination($),
    animes: extractAnimeCards($),
  };
};
