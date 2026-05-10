import { load, axios } from '../../utils/scrapper-deps.js';

const HIANIME_HOME_URL = 'https://hianime.ac/home-hianime';

// ─── Helper functions ──────────────────────────────────────────────────

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeWatchPath(href) {
  if (!href) return null;
  const clean = href.split('#')[0].trim();
  return clean.startsWith('/') ? clean : `/${clean}`;
}

function formatDate(date) {
  // date format: YYYY-MM-DD
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// ─── AJAX-based scraper ─────────────────────────────────────────

async function scrapeScheduleWithAjax(date) {
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const HIANIME_SCHEDULE_AJAX_URL = 'https://hianime.ac/ajax/schedule';

  let data = null;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await axios.get(HIANIME_SCHEDULE_AJAX_URL, {
        params: { date },
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://hianime.ac/home-hianime',
          'X-Requested-With': 'XMLHttpRequest',
          Accept: 'application/json, text/plain, */*',
        },
        timeout: 30000,
      });
      data = response.data;
      break;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await wait(500 * (attempt + 1));
      }
    }
  }

  if (!data) {
    throw lastError || new Error('Failed to fetch HiAnime schedule.');
  }

  if (data?.status !== 'ok' || typeof data?.result !== 'string') {
    return [];
  }

  // Parse the HTML result from the AJAX response
  const $ = load(data.result);
  const schedule = [];

  // Find all schedule items in the .body ul li a structure
  $('.body ul li a').each((_, el) => {
    const $item = $(el);
    const href = $item.attr('href') || '';
    const time = $item.find('.time').first().text().trim() || null;
    const titleEl = $item.find('.title').first();
    const title = titleEl.text().trim() || null;
    const episodeText = $item.find('span').last().text().trim();
    const episodeMatch = episodeText.match(/EP\s*(\d+)/i);
    const episode = episodeMatch ? Number(episodeMatch[1]) : null;
    const watchPath = normalizeWatchPath(href);
    const id = watchPath ? watchPath.replace(/^\/watch\//, '') : null;

    if (title) {
      schedule.push({
        id,
        title,
        time,
        episode,
        url: watchPath,
      });
    }
  });

  return schedule;
}

// ─── Main export ─────────────────────────────────────────────────────────

export async function getHiAnimeSchedule(date) {
  console.log(`[getHiAnimeSchedule] Using AJAX for date: ${date}`);
  return await scrapeScheduleWithAjax(date);
}