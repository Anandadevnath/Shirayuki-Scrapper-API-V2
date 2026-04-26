import { load } from '../../utils/scrapper-deps.js';

const ANIMEKAI_HOME_URL = 'https://anikai.to/home';

// Detect serverless environment
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  process.env.CF_PAGES ||
  process.env.RENDER ||
  process.env.RAILWAY
);

// ─── Puppeteer browser instance ──────────────────────────────────────────────

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    const puppeteer = await import('puppeteer');
    const puppeteerExtra = (await import('puppeteer-extra')).default;
    const stealth = (await import('puppeteer-extra-plugin-stealth')).default;

    puppeteerExtra.use(stealth());

    browserInstance = await puppeteerExtra.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--window-size=1920,1080',
      ],
    });
  }
  return browserInstance;
}

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

// ─── Puppeteer-based schedule scraper ─────────────────────────────────────────

async function scrapeScheduleWithPuppeteer(date) {
  const formattedDate = formatDate(date);
  let browser = null;
  let page = null;

  try {
    browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to home page
    console.log(`[getAnimekaiSchedule] Navigating to ${ANIMEKAI_HOME_URL}`);
    await page.goto(ANIMEKAI_HOME_URL, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the date picker to be loaded
    await page.waitForSelector('input[type="date"]', { timeout: 10000 });

    // Clear and set the date
    const dateInput = await page.$('input[type="date"]');
    await dateInput.click({ clickCount: 3 });
    await dateInput.type(formattedDate);

    // Wait for the schedule to update
    await wait(2000);

    // Wait for the schedule list to be updated
    await page.waitForSelector('.schedule-list .body ul li a', { timeout: 15000 });

    // Get the HTML content after date change
    const htmlContent = await page.evaluate(() => {
      const scheduleContainer = document.querySelector('.schedule-list .body ul');
      return scheduleContainer ? scheduleContainer.innerHTML : '';
    });

    // Parse the schedule from HTML
    const $ = load(`<ul>${htmlContent}</ul>`);
    const schedule = [];

    $('li a').each((_, el) => {
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

    console.log(`[getAnimekaiSchedule] Scraped ${schedule.length} items for date ${formattedDate}`);
    return schedule;

  } catch (error) {
    console.error('[getAnimekaiSchedule] Puppeteer error:', error.message);
    throw error;
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

// ─── Fallback: AJAX-based scraper ─────────────────────────────────────────

async function scrapeScheduleWithAjax(date) {
  const axios = (await import('axios')).default;
  const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

  const ANIMEKAI_SCHEDULE_AJAX_URL = 'https://anikai.to/ajax/schedule';

  let data = null;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await axios.get(ANIMEKAI_SCHEDULE_AJAX_URL, {
        params: { date },
        headers: {
          'User-Agent': USER_AGENT,
          Referer: 'https://anikai.to/home',
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
    throw lastError || new Error('Failed to fetch AnimeKai schedule.');
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

export async function getAnimekaiSchedule(date) {
  // Try Puppeteer first in non-serverless environments
  if (!isServerless) {
    try {
      console.log(`[getAnimekaiSchedule] Using Puppeteer for date: ${date}`);
      return await scrapeScheduleWithPuppeteer(date);
    } catch (puppeteerError) {
      console.error('[getAnimekaiSchedule] Puppeteer failed, falling back to AJAX:', puppeteerError.message);
    }
  }

  // Fallback to AJAX method
  console.log(`[getAnimekaiSchedule] Using AJAX fallback for date: ${date}`);
  return await scrapeScheduleWithAjax(date);
}