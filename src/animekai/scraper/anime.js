import { fetchAnimekaiPage } from './_shared.js';

const parseNumber = (value) => {
  const match = value?.match(/\d+/);
  return match ? Number(match[0]) : null;
};

const getWatchId = (href) => {
  if (!href) return null;
  const cleanHref = href.split('#')[0].split('?')[0].trim();
  const watchPrefix = '/watch/';
  if (cleanHref.startsWith(watchPrefix)) {
    return cleanHref.slice(watchPrefix.length) || null;
  }
  return cleanHref.replace(/^\//, '') || null;
};

export const getAnimekaiAnimeDetails = async (animeId) => {
  const { url, $ } = await fetchAnimekaiPage(`/watch/${animeId}`);

  const mainEntity = $('#main-entity');
  if (!mainEntity.length) {
    throw new Error('Anime not found or page structure changed');
  }

  const title = mainEntity.find('.title').first().text().trim() || null;
  const jname = mainEntity.find('.title').first().attr('data-jp')?.trim() || null;
  const altTitle = mainEntity.find('.al-title').first().text().trim() || null;
  const description = mainEntity.find('.desc').text().trim() || null;
  const poster = $('.entity-section .poster img').attr('src')?.trim() || null;

  const info = mainEntity.find('.info');
  const rating = info.find('.rating').text().trim() || null;
  const sub = parseNumber(info.find('.sub').text().trim() || '');
  const dub = parseNumber(info.find('.dub').text().trim() || '');
  const format = info.find('span b').first().text().trim() || null;

  const details = {};
  const genres = [];

  $('.detail > div > div').each((_, el) => {
    const $el = $(el);
    const text = $el.text().trim();
    if (text.includes(':')) {
      const parts = text.split(':');
      const key = parts[0].trim();
      const value = $el.find('span').first().text().trim() || parts.slice(1).join(':').trim();

      if (key === 'Genres') {
        $el.find('span a').each((__, a) => {
          genres.push($(a).text().trim());
        });
        if (genres.length === 0 && value) {
          value.split(',').forEach((g) => {
            const cleaned = g.trim();
            if (cleaned) genres.push(cleaned);
          });
        }
      } else {
        const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
        details[normalizedKey] = value;
      }
    }
  });

  const malLink = $('.detail a[href*="myanimelist.net"]').attr('href') || null;
  const alLink = $('.detail a[href*="anilist.co"]').attr('href') || null;

  const relations = [];
  $('#related-anime .tab-body').each((tabIdx, tab) => {
    const $tab = $(tab);
    const tabType = $('.sidebar #related-anime .dropdown-menu .dropdown-item.tab').eq(tabIdx).text().trim();

    $tab.find('.aitem').each((_, el) => {
      const $el = $(el);
      const href = $el.attr('href')?.trim();
      const relInfo = $el.find('.info b');
      relations.push({
        id: getWatchId(href),
        title: $el.find('.title').text().trim(),
        jname: $el.find('.title').attr('data-jp')?.trim(),
        poster: $el.attr('style')?.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1] || null,
        relation: relInfo.last().text().trim() || tabType,
        type: relInfo.length > 1 ? relInfo.eq(-2).text().trim() : null,
        episodes: {
          sub: parseNumber($el.find('.sub').text().trim()),
          dub: parseNumber($el.find('.dub').text().trim()),
        },
      });
    });
  });

  return {
    id: animeId,
    source: url,
    title,
    jname,
    altTitle,
    description,
    poster,
    rating,
    format,
    episodes: {
      sub,
      dub,
    },
    genres,
    details: {
      country: details.country || null,
      premiered: details.premiered || null,
      aired: details.dateaired || null,
      broadcast: details.broadcast || null,
      totalEpisodes: details.episodes || null,
      duration: details.duration || null,
      status: details.status || null,
      malScore: details.mal || null,
      studios: details.studios || null,
      producers: details.producers || null,
    },
    externalLinks: {
      mal: malLink,
      anilist: alLink,
    },
    relations,
  };
};
