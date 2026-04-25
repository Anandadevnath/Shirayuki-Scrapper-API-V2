import { fetchAnimekaiPage } from './_shared.js';
import { axios } from '../../utils/scrapper-deps.js';
import cloudscraper from 'cloudscraper';

const ANIMEKAI_BASE_URL = 'https://anikai.to';

// Detect serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = Boolean(
  process.env.VERCEL ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.NETLIFY ||
  process.env.CF_PAGES ||
  process.env.RENDER ||
  process.env.RAILWAY
);
const ANIMEKAI_EPISODES_URL = `${ANIMEKAI_BASE_URL}/ajax/episodes/list`;
const ANIMEKAI_SERVERS_URL = `${ANIMEKAI_BASE_URL}/ajax/links/list`;
const ANIMEKAI_LINKS_VIEW_URL = `${ANIMEKAI_BASE_URL}/ajax/links/view`;

const ENCDEC_ENC_KAI_URL = 'https://enc-dec.app/api/enc-kai';
const ENCDEC_DEC_KAI_URL = 'https://enc-dec.app/api/dec-kai';
const ENCDEC_DEC_MEGA_URL = 'https://enc-dec.app/api/dec-mega';

const DEFAULT_UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

// ─── Puppeteer for Cloudflare bypass ───────────────────────────────────────────

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

async function fetchMediaWithPuppeteer(mediaUrl, referer) {
  // In serverless environments, use cloudscraper as fallback
  // Puppeteer requires Chrome binary which is not available in serverless functions
  if (isServerless) {
    console.log('[fetchMediaWithPuppeteer] Using cloudscraper in serverless environment');
    try {
      const result = await cloudscraper({
        url: mediaUrl,
        headers: {
          'User-Agent': DEFAULT_UA,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': referer,
        },
        timeout: 15000,
        challengeTimeout: 20000,
      });
      
      // cloudscraper returns the body content directly
      // Try to extract JSON result from the response
      if (typeof result === 'string') {
        // Try to find JSON with result property in the response
        const jsonMatch = result.match(/\{[\s\S]*?"result"[\s\S]*?\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            return parsed.result || parsed;
          } catch {}
        }
      }
      
      // If cloudscraper returned parsed JSON already
      if (result && typeof result === 'object' && result.result) {
        return result.result;
      }
      
      console.log('[fetchMediaWithPuppeteer] cloudscraper returned no usable result');
      return null;
    } catch (cloudscraperError) {
      console.error('[fetchMediaWithPuppeteer] cloudscraper failed:', cloudscraperError.message);
      return null;
    }
  }

  let browser = null;
  let page = null;
  try {
    browser = await getBrowser();
    page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': referer,
    });
    
    await page.setUserAgent(DEFAULT_UA);
    
    // Set specific cookies for Cloudflare clearance if needed
    await page.setCookie({
      name: 'cf_clearance',
      value: 'placeholder_cf_clearance',
      domain: '.anikai.to',
      path: '/'
    });
    
    await page.goto(mediaUrl, {
      waitUntil: 'networkidle2',
      timeout: 45000,
    });
    
    // Wait for Cloudflare to clear - wait longer
    let cloudflareCleared = false;
    for (let i = 0; i < 30; i++) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      if (!bodyText.includes('Just a moment') && !bodyText.includes('Checking your browser')) {
        cloudflareCleared = true;
        break;
      }
      await page.waitForTimeout(1000);
    }
    
    console.log('[fetchMediaWithPuppeteer] Cloudflare cleared:', cloudflareCleared);
    
    // Try to get JSON response
    const content = await page.content();
    
    // Extract JSON from page by looking for result property
    let result = null;
    
    // First try: look for script with JSON data
    const scriptMatch = content.match(/window\.__PLAYER_DATA__\s*=\s*({[\s\S]*?})\s*;?\s*<\/script>/);
    if (scriptMatch) {
      try {
        result = JSON.parse(scriptMatch[1]).result;
      } catch {}
    }
    
    // Second try: look for any JSON with result property
    if (!result) {
      const jsonMatch = content.match(/\{[\s\S]*?"result"[\s\S]*?\}\s*;?\s*<\/script>/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0].replace(/<\/script>/, ''));
          if (parsed.result) {
            result = parsed.result;
          }
        } catch {}
      }
    }
    
    // Third try: evaluate page to get JSON from global variable
    if (!result) {
      const evalResult = await page.evaluate(() => {
        if (window.__PLAYER_DATA__) {
          return window.__PLAYER_DATA__;
        }
        // Try to find data in script tags
        const scripts = document.querySelectorAll('script:not([src])');
        for (const script of scripts) {
          const text = script.textContent;
          if (text.includes('"result"')) {
            const match = text.match(/\{[\s\S]*?"result"[\s\S]*?\}/);
            if (match) {
              try {
                return JSON.parse(match[0]);
              } catch {}
            }
          }
        }
        return null;
      });
      
      if (evalResult) {
        result = evalResult.result || evalResult;
      }
    }
    
    console.log('[fetchMediaWithPuppeteer] Result found:', result ? 'yes' : 'no');
    return result;
  } catch (error) {
    console.error('[fetchMediaWithPuppeteer] Error:', error.message);
    throw error;
  } finally {
    if (page) await page.close().catch(() => {});
  }
}

const parseEpisodeNumber = (animeEpisodeId, epQuery) => {
  if (epQuery && Number(epQuery) > 0) {
    return Number(epQuery);
  }

  if (!animeEpisodeId) return 1;

  const queryMatch = animeEpisodeId.match(/[?#&]ep=(\d+)/i);
  if (queryMatch) return Number(queryMatch[1]);

  return 1;
};

const normalizeAnimeId = (animeEpisodeId) => {
  if (!animeEpisodeId) return null;

  return animeEpisodeId
    .split('#')[0]
    .split('?')[0]
    .replace(/^\/watch\//, '')
    .trim();
};

const normalizeCategory = (category) => {
  const c = String(category || 'sub').toLowerCase().trim();
  if (c === 'dub' || c === 'softsub' || c === 'sub') return c;
  return 'sub';
};

const normalizeServer = (server) => {
  const s = String(server || 'server-1').toLowerCase().trim();
  if (s === 'server-1' || s === 'server-2') return s;
  return 'server-1';
};

async function encKai(text) {
  const resp = await axios.get(ENCDEC_ENC_KAI_URL, {
    proxy: false,
    timeout: 15000,
    params: { text },
    headers: { 'User-Agent': DEFAULT_UA, Accept: 'application/json' },
  });
  if (resp?.data?.status !== 200 || !resp?.data?.result) {
    throw new Error('Token encryption failed');
  }
  return resp.data.result;
}

async function decKai(text) {
  const resp = await axios.post(
    ENCDEC_DEC_KAI_URL,
    { text },
    {
      proxy: false,
      timeout: 15000,
      headers: { 'User-Agent': DEFAULT_UA, Accept: 'application/json' },
    }
  );
  if (resp?.data?.status !== 200 || !resp?.data?.result) {
    throw new Error('Embed decryption failed');
  }
  return resp.data.result;
}

async function decMega(text) {
  const resp = await axios.post(
    ENCDEC_DEC_MEGA_URL,
    { text, agent: DEFAULT_UA },
    {
      proxy: false,
      timeout: 20000,
      headers: { 'User-Agent': DEFAULT_UA, Accept: 'application/json' },
    }
  );
  if (resp?.data?.status !== 200 || !resp?.data?.result) {
    throw new Error('Media decryption failed');
  }
  return resp.data.result;
}

function extractAniIdFromWatchPage($) {
  const sync = $('#syncData').first().text().trim();
  if (!sync) return null;
  try {
    const json = JSON.parse(sync);
    return json?.anime_id ? String(json.anime_id) : null;
  } catch {
    return null;
  }
}

function pickServerFromList($, category, normalizedServer) {
  const servers = $(`.server-items[data-id="${category}"] .server`)
    .map((_, el) => ({
      name: $(el).text().trim() || null,
      serverId: $(el).attr('data-sid') || null,
      episodeId: $(el).attr('data-eid') || null,
      linkId: $(el).attr('data-lid') || null,
    }))
    .get()
    .filter((s) => s.linkId);

  if (!servers.length) return null;
  const index = normalizedServer === 'server-2' ? 1 : 0;
  return servers[index] ?? servers[0];
}

function findEpisodeToken($, episodeNumber, category) {
  const target = Number(episodeNumber);
  const items = $('.eplist a')
    .map((_, el) => ({
      num: Number($(el).attr('num') || ''),
      token: $(el).attr('token') || null,
      langs: $(el).attr('langs') || '0',
    }))
    .get()
    .filter((x) => x.token && Number.isFinite(x.num));

  const ep = items.find((x) => x.num === target) ?? null;
  if (!ep) return null;

  const langs = String(ep.langs || '0');
  const langsNum = /^\d+$/.test(langs) ? Number(langs) : 0;
  const hasSub = Boolean(langsNum & 1);
  const hasDub = Boolean(langsNum & 2);

  const wantsDub = category === 'dub';
  if (wantsDub && !hasDub) return null;
  if (!wantsDub && !hasSub) return null;

  return ep.token;
}

function parseSubtitleTracksFromM3u8(m3u8Content, m3u8Url) {
  const tracks = [];
  if (!m3u8Content || typeof m3u8Content !== 'string') return tracks;

  // Get base URL for resolving relative paths
  const baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);

  // Parse EXT-X-MEDIA lines with TYPE=SUBTITLES
  const mediaRegex = /#EXT-X-MEDIA:TYPE=SUBTITLES[^,\n]*(?:,[^,\n]*)*/g;
  const matches = m3u8Content.match(mediaRegex) || [];

  for (const match of matches) {
    const groupIdMatch = match.match(/GROUP-ID="([^"]+)"/);
    const nameMatch = match.match(/NAME="([^"]+)"/);
    const langMatch = match.match(/LANGUAGE="([^"]+)"/);
    const uriMatch = match.match(/URI="([^"]+)"/);
    const defaultMatch = match.match(/DEFAULT=([^,\s]+)/);
    const forcedMatch = match.match(/FORCED=([^,\s]+)/);

    if (uriMatch) {
      let fileUrl = uriMatch[1];
      
      // Make relative URLs absolute
      if (fileUrl.startsWith('//')) {
        fileUrl = 'https:' + fileUrl;
      } else if (fileUrl.startsWith('/')) {
        const urlObj = new URL(m3u8Url);
        fileUrl = `${urlObj.origin}${fileUrl}`;
      } else if (!fileUrl.startsWith('http')) {
        fileUrl = baseUrl + fileUrl;
      }

      tracks.push({
        file: fileUrl,
        label: nameMatch ? nameMatch[1] : 'Unknown',
        kind: 'subtitle',
        default: defaultMatch ? defaultMatch[1] === 'YES' : false,
        forced: forcedMatch ? forcedMatch[1] === 'YES' : false,
      });
    }
  }

  return tracks;
}

function normalizeTracks(tracks) {
  if (!Array.isArray(tracks)) return [];

  const seen = new Set();
  const normalized = [];

  for (const t of tracks) {
    const file = t?.file || t?.src || t?.url || null;
    if (!file || typeof file !== 'string') continue;

    const label = typeof t?.label === 'string' && t.label.trim() ? t.label.trim() : 'Unknown';
    const kind = typeof t?.kind === 'string' && t.kind.trim()
      ? t.kind.trim()
      : (typeof t?.type === 'string' && t.type.trim() ? t.type.trim() : 'captions');
    const def = Boolean(t?.default ?? t?.isDefault ?? false);
    const forced = Boolean(t?.forced ?? false);

    const key = `${file}|${label}|${kind}`;
    if (seen.has(key)) continue;
    seen.add(key);

    normalized.push({ file, label, kind, default: def, forced });
  }

  return normalized;
}

function extractTracksFromMediaData(mediaData) {
  const candidates = [];

  if (Array.isArray(mediaData?.tracks)) candidates.push(...mediaData.tracks);
  if (Array.isArray(mediaData?.subtitles)) candidates.push(...mediaData.subtitles);
  if (Array.isArray(mediaData?.captions)) candidates.push(...mediaData.captions);
  if (mediaData?.track) {
    if (Array.isArray(mediaData.track)) candidates.push(...mediaData.track);
    else candidates.push(mediaData.track);
  }

  return normalizeTracks(candidates);
}

export const getAnimekaiEpisodeSources = async ({ animeEpisodeId, ep, server, category }) => {
  const animeId = normalizeAnimeId(animeEpisodeId);

  if (!animeId) {
    throw new Error('animeEpisodeId query parameter is required');
  }

  const episodeNumber = parseEpisodeNumber(animeEpisodeId, ep);
  const normalizedServer = normalizeServer(server);
  const normalizedCategory = normalizeCategory(category);

  const { url, $ } = await fetchAnimekaiPage(`/watch/${animeId}`, { ep: episodeNumber });
  const title = $('.watch-section .main-entity .title').first().text().trim() || null;

  const watchUrl = `${ANIMEKAI_BASE_URL}/watch/${animeId}#ep=${episodeNumber}`;

  const ajaxHeaders = {
    'User-Agent': DEFAULT_UA,
    Accept: 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest',
    Referer: ANIMEKAI_BASE_URL,
  };

  // 1. Extract anime ID from watch page
  const aniId = extractAniIdFromWatchPage($);
  if (!aniId) {
    throw new Error('AnimeKai watch page did not include syncData anime_id');
  }

  // 2. Get episode list and find episode token
  const episodesEnc = await encKai(aniId);
  const episodesResp = await axios.get(ANIMEKAI_EPISODES_URL, {
    proxy: false,
    timeout: 15000,
    headers: {
      ...ajaxHeaders,
      Referer: watchUrl,
    },
    params: { ani_id: aniId, _: episodesEnc },
  });
  const episodesHtml = episodesResp?.data?.result ?? '';
  if (!episodesHtml) {
    throw new Error('AnimeKai episodes ajax returned empty result');
  }

  const { load } = await import('cheerio');
  const $episodes = load(String(episodesHtml));
  const epToken = findEpisodeToken($episodes, episodeNumber, normalizedCategory);
  if (!epToken) {
    throw new Error('Unable to locate episode token for requested episode/category');
  }

  // 3. Get server list and find server linkId
  const serversEnc = await encKai(epToken);
  const serversResp = await axios.get(ANIMEKAI_SERVERS_URL, {
    proxy: false,
    timeout: 15000,
    headers: {
      ...ajaxHeaders,
      Referer: watchUrl,
    },
    params: { token: epToken, _: serversEnc },
  });
  const serversHtml = serversResp?.data?.result ?? '';
  if (!serversHtml) {
    throw new Error('AnimeKai servers ajax returned empty result');
  }

  const $servers = load(String(serversHtml));
  const picked = pickServerFromList($servers, normalizedCategory, normalizedServer);
  if (!picked?.linkId) {
    throw new Error('No server linkId found for requested category/server');
  }

  // 4. Get encrypted embed URL
  const linkEnc = await encKai(picked.linkId);
  const viewResp = await axios.get(ANIMEKAI_LINKS_VIEW_URL, {
    proxy: false,
    timeout: 15000,
    headers: {
      ...ajaxHeaders,
      Referer: watchUrl,
    },
    params: { id: picked.linkId, _: linkEnc },
  });
  const encryptedEmbed = viewResp?.data?.result ?? '';
  if (!encryptedEmbed) {
    throw new Error('AnimeKai links/view returned empty result');
  }

  // 5. Decrypt embed URL
  const embedData = await decKai(encryptedEmbed);
  const embedUrl = embedData?.url ? String(embedData.url) : null;
  if (!embedUrl) {
    throw new Error('Decrypted embed payload did not contain url');
  }

  console.log('[getAnimekaiEpisodeSources] Decrypted Embed URL:', embedUrl);

  // 6. Extract video_id and embed_base from embed URL
  const videoId = embedUrl.replace(/\/+$/, '').split('/').pop();
  
  // Extract base URL - handle both /e/ format and regular format
  let embedBase;
  if (embedUrl.includes('/e/')) {
    embedBase = embedUrl.split('/e/')[0];
  } else {
    const lastSlashIdx = embedUrl.lastIndexOf('/');
    embedBase = embedUrl.substring(0, lastSlashIdx);
  }
  
  console.log('[getAnimekaiEpisodeSources] Video ID:', videoId);
  console.log('[getAnimekaiEpisodeSources] Embed Base:', embedBase);

  // 7. Fetch /media/{videoId} to get encrypted media data
  let m3u8 = null;
  let tracks = [];

  const resolveTracksForCategory = async (targetCategory) => {
    try {
      const altToken = findEpisodeToken($episodes, episodeNumber, targetCategory);
      if (!altToken) return [];

      const altServersEnc = await encKai(altToken);
      const altServersResp = await axios.get(ANIMEKAI_SERVERS_URL, {
        proxy: false,
        timeout: 15000,
        headers: {
          ...ajaxHeaders,
          Referer: watchUrl,
        },
        params: { token: altToken, _: altServersEnc },
      });

      const altServersHtml = altServersResp?.data?.result ?? '';
      if (!altServersHtml) return [];

      const $altServers = load(String(altServersHtml));
      const altPicked = pickServerFromList($altServers, targetCategory, normalizedServer);
      if (!altPicked?.linkId) return [];

      const altLinkEnc = await encKai(altPicked.linkId);
      const altViewResp = await axios.get(ANIMEKAI_LINKS_VIEW_URL, {
        proxy: false,
        timeout: 15000,
        headers: {
          ...ajaxHeaders,
          Referer: watchUrl,
        },
        params: { id: altPicked.linkId, _: altLinkEnc },
      });

      const altEncryptedEmbed = altViewResp?.data?.result ?? '';
      if (!altEncryptedEmbed) return [];

      const altEmbedData = await decKai(altEncryptedEmbed);
      const altEmbedUrl = altEmbedData?.url ? String(altEmbedData.url) : null;
      if (!altEmbedUrl) return [];

      const altVideoId = altEmbedUrl.replace(/\/+$/, '').split('/').pop();
      const altEmbedBase = altEmbedUrl.includes('/e/')
        ? altEmbedUrl.split('/e/')[0]
        : altEmbedUrl.substring(0, altEmbedUrl.lastIndexOf('/'));
      const altMediaUrl = `${altEmbedBase}/media/${altVideoId}`;

      const altMediaResp = await axios.get(altMediaUrl, {
        proxy: false,
        timeout: 15000,
        headers: {
          'User-Agent': DEFAULT_UA,
          'X-Requested-With': 'XMLHttpRequest',
          Referer: altEmbedUrl,
        },
      });

      const altEncryptedMedia = altMediaResp?.data?.result ?? '';
      if (!altEncryptedMedia || typeof altEncryptedMedia !== 'string') return [];

      const altMediaData = await decMega(altEncryptedMedia);
      const mediaTracks = extractTracksFromMediaData(altMediaData);
      if (mediaTracks.length) return mediaTracks;

      const altM3u8 =
        (Array.isArray(altMediaData?.sources)
          ? altMediaData.sources.find((s) => typeof s?.file === 'string' && s.file.includes('.m3u8'))?.file
          : null)
        ?? (typeof altMediaData?.file === 'string' && altMediaData.file.includes('.m3u8') ? altMediaData.file : null)
        ?? (typeof altMediaData?.url === 'string' && altMediaData.url.includes('.m3u8') ? altMediaData.url : null)
        ?? (typeof altMediaData?.source === 'string' && altMediaData.source.includes('.m3u8') ? altMediaData.source : null);

      if (!altM3u8) return [];

      const altM3u8Resp = await axios.get(altM3u8, {
        proxy: false,
        timeout: 15000,
        headers: {
          'User-Agent': DEFAULT_UA,
          Referer: altEmbedUrl,
        },
      });

      return normalizeTracks(parseSubtitleTracksFromM3u8(altM3u8Resp?.data || '', altM3u8));
    } catch (err) {
      console.log('[getAnimekaiEpisodeSources] Alternate category track fetch failed:', err.message);
      return [];
    }
  };

  try {
    const mediaUrl = `${embedBase}/media/${videoId}`;
    console.log('[getAnimekaiEpisodeSources] Fetching media from:', mediaUrl);
    
    let encryptedMedia = null;
    
    // First try direct axios request
    try {
      const mediaResp = await axios.get(mediaUrl, {
        proxy: false,
        timeout: 15000,
        headers: {
          'User-Agent': DEFAULT_UA,
          'X-Requested-With': 'XMLHttpRequest',
          Referer: embedUrl,
        },
      });

      encryptedMedia = mediaResp?.data?.result ?? '';
      
      // Check if we got Cloudflare page instead
      if (typeof encryptedMedia === 'string' && encryptedMedia.includes('Just a moment')) {
        console.log('[getAnimekaiEpisodeSources] Got Cloudflare challenge, trying Puppeteer...');
        encryptedMedia = null;
      }
    } catch (axiosError) {
      console.log('[getAnimekaiEpisodeSources] Axios request failed, trying Puppeteer:', axiosError.message);
    }

    // If direct request failed (Cloudflare), use Puppeteer
    if (!encryptedMedia) {
      console.log('[getAnimekaiEpisodeSources] Calling Puppeteer for media...');
      try {
        encryptedMedia = await fetchMediaWithPuppeteer(mediaUrl, embedUrl);
        console.log('[getAnimekaiEpisodeSources] Puppeteer returned:', encryptedMedia ? 'data' : 'null');
      } catch (puppeteerError) {
        console.error('[getAnimekaiEpisodeSources] Puppeteer also failed:', puppeteerError.message);
      }
    } else {
      console.log('[getAnimekaiEpisodeSources] Using direct axios response');
    }

    console.log('[getAnimekaiEpisodeSources] Encrypted media response:', encryptedMedia ? `length=${encryptedMedia.length}` : 'null');

    if (encryptedMedia && typeof encryptedMedia === 'string' && encryptedMedia.length > 0) {
      // 8. Decrypt the media to get m3u8 sources
      const mediaData = await decMega(encryptedMedia);
      console.log('[getAnimekaiEpisodeSources] Full decrypted media data:', JSON.stringify(mediaData, null, 2));

      if (mediaData) {
        tracks = extractTracksFromMediaData(mediaData);

        if (!tracks.length && normalizedCategory === 'sub') {
          const fallbackTracks = await resolveTracksForCategory('dub');
          if (fallbackTracks.length) {
            console.log('[getAnimekaiEpisodeSources] Using dub category tracks as fallback for sub request.');
            tracks = fallbackTracks;
          }
        }

        // Try to find m3u8 in various places
        m3u8 = null;
        
        // Check sources array
        if (mediaData?.sources) {
          const sources = Array.isArray(mediaData.sources) ? mediaData.sources : [];
          m3u8 = sources.find((s) => typeof s?.file === 'string' && s.file.includes('.m3u8'))?.file
            ?? sources.find((s) => typeof s?.url === 'string' && s.url.includes('.m3u8'))?.url
            ?? null;
        }
        
        // Try mediaData.file directly
        if (!m3u8 && mediaData?.file?.includes?.('.m3u8')) {
          m3u8 = mediaData.file;
        }
        
        // Try mediaData.url directly
        if (!m3u8 && mediaData?.url?.includes?.('.m3u8')) {
          m3u8 = mediaData.url;
        }
        
        // Try mediaData.source directly
        if (!m3u8 && typeof mediaData?.source === 'string' && mediaData.source.includes('.m3u8')) {
          m3u8 = mediaData.source;
        }

        console.log('[getAnimekaiEpisodeSources] m3u8:', m3u8);
        
        // If m3u8 found and tracks are still empty, fetch it and parse subtitle tracks.
        if (m3u8) {
          if (!tracks.length) {
            try {
              const m3u8Resp = await axios.get(m3u8, {
                proxy: false,
                timeout: 12000,
                headers: {
                  'User-Agent': DEFAULT_UA,
                  Referer: embedUrl,
                },
              });
              
              const m3u8Content = m3u8Resp?.data || '';
              console.log('[getAnimekaiEpisodeSources] Parsing m3u8 content for tracks...');
              
              // Parse m3u8 for subtitle tracks (EXT-X-MEDIA with TYPE=SUBTITLES)
              const m3u8Tracks = normalizeTracks(parseSubtitleTracksFromM3u8(m3u8Content, m3u8));
              if (m3u8Tracks.length) {
                tracks = m3u8Tracks;
              }
              console.log('[getAnimekaiEpisodeSources] Parsed tracks:', JSON.stringify(tracks));
            } catch (m3u8Error) {
              console.log('[getAnimekaiEpisodeSources] Failed to fetch/parse m3u8:', m3u8Error.message);
            }
          }
          
          return {
            animeId,
            title,
            episode: episodeNumber,
            sourcePage: url,
            sources: [
              {
                source: m3u8,
                type: 'm3u8',
                quality: null,
                referer: embedUrl,
                server: normalizedServer,
                category: normalizedCategory,
                embed: embedUrl,
              },
            ],
            tracks,
            intro: embedData?.skip?.intro ?? null,
            outro: embedData?.skip?.outro ?? null,
          };
        }
      }
    }
  } catch (mediaError) {
    console.error('[getAnimekaiEpisodeSources] Error fetching/decrypting media:', mediaError.message);
  }

  // 9. Return the result
  if (m3u8) {
    return {
      animeId,
      title,
      episode: episodeNumber,
      sourcePage: url,
      sources: [
        {
          source: m3u8,
          type: 'm3u8',
          quality: null,
          referer: embedUrl,
          server: normalizedServer,
          category: normalizedCategory,
          embed: embedUrl,
        },
      ],
      tracks,
      intro: embedData?.skip?.intro ?? null,
      outro: embedData?.skip?.outro ?? null,
    };
  }

  // Fallback: return embed URL as iframe source
  console.log('[getAnimekaiEpisodeSources] No m3u8 found, returning embed URL');
  
  // Try to get tracks from embedData if available
  let fallbackTracks = [];
  if (embedData?.tracks) {
    fallbackTracks = Array.isArray(embedData.tracks) ? embedData.tracks : [];
  } else if (embedData?.track) {
    fallbackTracks = Array.isArray(embedData.track) ? embedData.track : [embedData.track].filter(Boolean);
  }
  
  console.log('[getAnimekaiEpisodeSources] Fallback tracks from embedData:', JSON.stringify(fallbackTracks));
  
  return {
    animeId,
    title,
    episode: episodeNumber,
    sourcePage: url,
    sources: [
      {
        source: embedUrl,
        type: 'iframe',
        quality: null,
        referer: `${ANIMEKAI_BASE_URL}/`,
        server: normalizedServer,
        category: normalizedCategory,
        embed: embedUrl,
      },
    ],
    tracks: normalizeTracks(fallbackTracks),
    intro: embedData?.skip?.intro ?? null,
    outro: embedData?.skip?.outro ?? null,
  };
};
