import { getAnimekaiSearchResults } from './search.js';

export const getAnimekaiSearchSuggestion = async (q) => {
  const data = await getAnimekaiSearchResults(q, 1);

  return {
    source: data.source,
    query: q,
    suggestions: data.animes.slice(0, 10).map((anime) => ({
      id: anime.id,
      title: anime.title,
      jname: anime.jname,
      poster: anime.poster,
      href: anime.href,
      watchUrl: anime.watchUrl,
      type: anime.type,
    })),
  };
};
