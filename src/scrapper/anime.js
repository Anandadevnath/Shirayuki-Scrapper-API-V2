import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const extractAnimes = ($, selector) => {
  const animes = [];
  
  $(selector).each((_, el) => {
    const animeId = $(el)
      .find('.film-detail .film-name .dynamic-name')
      ?.attr('href')
      ?.slice(1)
      .split('?ref=search')[0] || null;

    animes.push({
      id: animeId,
      name: $(el)
        .find('.film-detail .film-name .dynamic-name')
        ?.text()
        ?.trim(),
      jname: $(el)
        .find('.film-detail .film-name .dynamic-name')
        ?.attr('data-jname')
        ?.trim() || null,
      poster: $(el)
        .find('.film-poster .film-poster-img')
        ?.attr('data-src')
        ?.trim() || null,
      duration: $(el)
        .find('.film-detail .fd-infor .fdi-item.fdi-duration')
        ?.text()
        ?.trim(),
      type: $(el)
        .find('.film-detail .fd-infor .fdi-item:nth-of-type(1)')
        ?.text()
        ?.trim(),
      rating: $(el).find('.film-poster .tick-rate')?.text()?.trim() || null,
      episodes: {
        sub: Number(
          $(el)
            .find('.film-poster .tick-sub')
            ?.text()
            ?.trim()
            .split(' ')
            .pop()
        ) || null,
        dub: Number(
          $(el)
            .find('.film-poster .tick-dub')
            ?.text()
            ?.trim()
            .split(' ')
            .pop()
        ) || null,
      },
    });
  });

  return animes;
};

const extractMostPopularAnimes = ($, selector) => {
  const animes = [];

  $(selector).each((_, el) => {
    animes.push({
      id: $(el)
        .find('.film-detail .dynamic-name')
        ?.attr('href')
        ?.slice(1)
        .trim() || null,
      name: $(el).find('.film-detail .dynamic-name')?.text()?.trim() || null,
      jname: $(el)
        .find('.film-detail .film-name .dynamic-name')
        .attr('data-jname')
        ?.trim() || null,
      poster: $(el)
        .find('.film-poster .film-poster-img')
        ?.attr('data-src')
        ?.trim() || null,
      episodes: {
        sub: Number(
          $(el)
            ?.find('.fd-infor .tick .tick-sub')
            ?.text()
            ?.trim()
        ) || null,
        dub: Number(
          $(el)
            ?.find('.fd-infor .tick .tick-dub')
            ?.text()
            ?.trim()
        ) || null,
      },
      type: $(el)
        ?.find('.fd-infor .tick')
        ?.text()
        ?.trim()
        ?.replace(/[\s\n]+/g, ' ')
        ?.split(' ')
        ?.pop() || null,
    });
  });

  return animes;
};

export async function getAnimeAboutInfo(animeId) {
  const res = {
    anime: {
      info: {
        id: null,
        anilistId: null,
        malId: null,
        name: null,
        poster: null,
        description: null,
        stats: {
          rating: null,
          quality: null,
          episodes: {
            sub: null,
            dub: null,
          },
          type: null,
          duration: null,
        },
        promotionalVideos: [],
        charactersVoiceActors: [],
      },
      moreInfo: {},
    },
    seasons: [],
    mostPopularAnimes: [],
    relatedAnimes: [],
    recommendedAnimes: [],
  };

  try {
    if (animeId.trim() === '' || animeId.indexOf('-') === -1) {
      throw new Error('Invalid anime id');
    }

    const animeUrl = `${SRC_BASE_URL}/${animeId}`;
    const { data } = await axios.get(animeUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    // Extract anilist and MAL IDs
    try {
      const syncData = JSON.parse($('body')?.find('#syncData')?.text());
      res.anime.info.anilistId = Number(syncData?.anilist_id) || null;
      res.anime.info.malId = Number(syncData?.mal_id) || null;
    } catch (err) {
      res.anime.info.anilistId = null;
      res.anime.info.malId = null;
    }

    const selector = '#ani_detail .container .anis-content';

    res.anime.info.id = $(selector)
      ?.find('.anisc-detail .film-buttons a.btn-play')
      ?.attr('href')
      ?.split('/')
      ?.pop() || null;
    
    res.anime.info.name = $(selector)
      ?.find('.anisc-detail .film-name.dynamic-name')
      ?.text()
      ?.trim() || null;
    
    res.anime.info.description = $(selector)
      ?.find('.anisc-detail .film-description .text')
      .text()
      ?.split('[')
      ?.shift()
      ?.trim() || null;
    
    res.anime.info.poster = $(selector)
      ?.find('.film-poster .film-poster-img')
      ?.attr('src')
      ?.trim() || null;

    // Stats
    res.anime.info.stats.rating = $(`${selector} .film-stats .tick .tick-pg`)?.text()?.trim() || null;
    res.anime.info.stats.quality = $(`${selector} .film-stats .tick .tick-quality`)?.text()?.trim() || null;
    res.anime.info.stats.episodes = {
      sub: Number($(`${selector} .film-stats .tick .tick-sub`)?.text()?.trim()) || null,
      dub: Number($(`${selector} .film-stats .tick .tick-dub`)?.text()?.trim()) || null,
    };
    res.anime.info.stats.type = $(`${selector} .film-stats .tick`)
      ?.text()
      ?.trim()
      ?.replace(/[\s\n]+/g, ' ')
      ?.split(' ')
      ?.at(-2) || null;
    res.anime.info.stats.duration = $(`${selector} .film-stats .tick`)
      ?.text()
      ?.trim()
      ?.replace(/[\s\n]+/g, ' ')
      ?.split(' ')
      ?.pop() || null;

    // Promotional videos
    $('.block_area.block_area-promotions .block_area-promotions-list .screen-items .item').each((_, el) => {
      res.anime.info.promotionalVideos.push({
        title: $(el).attr('data-title'),
        source: $(el).attr('data-src'),
        thumbnail: $(el).find('img').attr('src'),
      });
    });

    // Characters and voice actors
    $('.block_area.block_area-actors .block-actors-content .bac-list-wrap .bac-item').each((_, el) => {
      res.anime.info.charactersVoiceActors.push({
        character: {
          id: $(el)
            .find($('.per-info.ltr .pi-avatar'))
            .attr('href')
            ?.split('/')[2] || '',
          poster: $(el)
            .find($('.per-info.ltr .pi-avatar img'))
            .attr('data-src') || '',
          name: $(el).find($('.per-info.ltr .pi-detail a')).text(),
          cast: $(el)
            .find($('.per-info.ltr .pi-detail .pi-cast'))
            .text(),
        },
        voiceActor: {
          id: $(el)
            .find($('.per-info.rtl .pi-avatar'))
            .attr('href')
            ?.split('/')[2] || '',
          poster: $(el)
            .find($('.per-info.rtl .pi-avatar img'))
            .attr('data-src') || '',
          name: $(el).find($('.per-info.rtl .pi-detail a')).text(),
          cast: $(el)
            .find($('.per-info.rtl .pi-detail .pi-cast'))
            .text(),
        },
      });
    });

    // More information
    $(`${selector} .anisc-info-wrap .anisc-info .item:not(.w-hide)`).each((_, el) => {
      let key = $(el)
        .find('.item-head')
        .text()
        .toLowerCase()
        .replace(':', '')
        .trim();
      key = key.includes(' ') ? key.replace(' ', '') : key;

      const value = [
        ...$(el)
          .find('*:not(.item-head)')
          .map((_, el) => $(el).text().trim()),
      ]
        .map((i) => `${i}`)
        .toString()
        .trim();

      if (key === 'genres') {
        res.anime.moreInfo[key] = value.split(',').map((i) => i.trim());
        return;
      }
      if (key === 'producers') {
        res.anime.moreInfo[key] = value.split(',').map((i) => i.trim());
        return;
      }
      res.anime.moreInfo[key] = value;
    });

    // Seasons
    const seasonsSelector = '#main-content .os-list a.os-item';
    $(seasonsSelector).each((_, el) => {
      res.seasons.push({
        id: $(el)?.attr('href')?.slice(1)?.trim() || null,
        name: $(el)?.attr('title')?.trim() || null,
        title: $(el)?.find('.title')?.text()?.trim(),
        poster: $(el)
          ?.find('.season-poster')
          ?.attr('style')
          ?.split(' ')
          ?.pop()
          ?.split('(')
          ?.pop()
          ?.split(')')[0] || null,
        isCurrent: $(el).hasClass('active'),
      });
    });

    // Related animes
    const relatedAnimeSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(1) .anif-block-ul ul li';
    res.relatedAnimes = extractMostPopularAnimes($, relatedAnimeSelector);

    // Most popular animes
    const mostPopularSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime:nth-of-type(2) .anif-block-ul ul li';
    res.mostPopularAnimes = extractMostPopularAnimes($, mostPopularSelector);

    // Recommended animes
    const recommendedAnimeSelector = '#main-content .block_area.block_area_category .tab-content .flw-item';
    res.recommendedAnimes = extractAnimes($, recommendedAnimeSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to get anime info: ${error.message}`);
  }
}
