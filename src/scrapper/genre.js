import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
import { extractAnimes } from '../utils/scrapper-helpers.js';

export async function getGenreAnime(genreName, page = 1) {
  const res = {
    // there's a typo with hianime where "martial" arts is "marial" arts
    genreName: genreName === 'martial-arts' ? 'marial-arts' : genreName.trim(),
    animes: [],
    genres: [],
    topAiringAnimes: [],
    totalPages: 1,
    hasNextPage: false,
    currentPage: (Number(page) || 0) < 1 ? 1 : Number(page),
  };

  genreName = res.genreName;
  page = res.currentPage;

  try {
    if (genreName === '') {
      throw new Error('Invalid genre name');
    }

    const genreUrl = `${SRC_BASE_URL}/genre/${genreName}?page=${page}`;

    const { data } = await axios.get(genreUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    const $ = load(data);

    const selector = '#main-content .tab-content .film_list-wrap .flw-item';

    const genreNameSelector = '#main-content .block_area .block_area-header .cat-heading';
    res.genreName = $(genreNameSelector)?.text()?.trim() ?? genreName;

    // Check pagination
    res.hasNextPage =
      $('.pagination > li').length > 0
        ? $('.pagination li.active').length > 0
          ? $('.pagination > li').last().hasClass('active')
            ? false
            : true
          : false
        : false;

    res.totalPages =
      Number(
        $('.pagination > .page-item a[title="Last"]')
          ?.attr('href')
          ?.split('=')
          .pop() ??
          $('.pagination > .page-item a[title="Next"]')
            ?.attr('href')
            ?.split('=')
            .pop() ??
          $('.pagination > .page-item.active a')?.text()?.trim()
      ) || 1;

    res.animes = extractAnimes($, selector);

    if (res.animes.length === 0 && !res.hasNextPage) {
      res.totalPages = 0;
    }

    // Genres list
    const genreSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-genres .sb-genre-list li';
    $(genreSelector).each((_, el) => {
      res.genres.push($(el).text().trim());
    });

    // Top Airing Animes
    const topAiringSelector = '#main-sidebar .block_area.block_area_sidebar.block_area-realtime .anif-block-ul ul li';
    res.topAiringAnimes = extractMostPopularAnimes($, topAiringSelector);

    return res;
  } catch (error) {
    throw new Error(`Failed to get genre animes: ${error.message}`);
  }
}
