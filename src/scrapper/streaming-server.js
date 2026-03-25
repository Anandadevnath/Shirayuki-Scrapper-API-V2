import { load, axios } from '../utils/scrapper-deps.js';
import { USER_AGENT } from '../utils/constants.js';

const ANIWATCH_BASE_URL = 'https://aniwatchtv.to';
const ANIWATCH_AJAX_URL = `${ANIWATCH_BASE_URL}/ajax/v2`;

const SERVER_MAP = {
  'hd-1': 'vidsrc',
  'hd-2': 'megacloud',
  'vidcloud': 'megacloud',
  'vidstreaming': 'vidsrc',
  'vidsrc': 'vidsrc',
  'megacloud': 'megacloud',
  'mega': 'megacloud',
  'mycloud': 'mycloud',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const normalizeServerName = (server = 'vidcloud') =>
  SERVER_MAP[String(server).toLowerCase().trim()] ?? String(server).toLowerCase().trim();

const getIframeIdFromLink = (link) =>
  (typeof link === 'string' && link.match(/\/e-1\/([^/?]+)/i)?.[1]) || null;

function collectM3u8Links(value, output = new Set()) {
  if (!value) return output;
  if (typeof value === 'string') {
    if (value.trim().includes('.m3u8')) output.add(value.trim());
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectM3u8Links(item, output));
  } else if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectM3u8Links(item, output));
  }
  return output;
}

const normalizeTracks = (tracks) =>
  Array.isArray(tracks)
    ? tracks
        .filter((t) => t?.file)
        .map(({ file, label = null, kind = null, default: def = false }) => ({
          file,
          label,
          kind,
          default: Boolean(def),
        }))
    : [];

function collectServerCandidates($, category) {
  const candidates = [];
  $(`.servers-${category} .server-item`).each((_, el) => {
    const serverName = $(el).find('a').text().toLowerCase().trim();
    const serverId = Number($(el).attr('data-id') || $(el).attr('data-server-id')) || null;
    if (serverName && serverId) candidates.push({ serverName, serverId });
  });
  return candidates;
}

// ─── Source Fetchers ──────────────────────────────────────────────────────────

function buildAjaxHeaders(referer, cookieHeader) {
  return {
    'User-Agent': USER_AGENT,
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': referer,
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

async function fetchSources(iframeLink, fetchFn) {
  const iframeId = getIframeIdFromLink(iframeLink);
  if (!iframeId) return null;
  try {
    return await fetchFn(iframeLink, iframeId);
  } catch (error) {
    console.error(`[fetchSources] Error for ${iframeLink}:`, error.message);
    return null;
  }
}

async function getRapidCloudSources(iframeLink) {
  return fetchSources(iframeLink, async (link, id) => {
    const url = new URL(link);
    const pathMatch = url.pathname.match(/\/embed-2\/([^/]+\/)?e-1\//);
    const versionPath = pathMatch?.[0] ?? '/embed-2/ajax/e-1/';

    const { data } = await axios.get(
      `https://${url.hostname}${versionPath}getSources?id=${encodeURIComponent(id)}`,
      {
        headers: { 'User-Agent': USER_AGENT, 'X-Requested-With': 'XMLHttpRequest', Referer: link },
        timeout: 15000,
      }
    );
    return data;
  });
}

async function getMegaCloudSources(iframeLink) {
  return fetchSources(iframeLink, async (link, id) => {
    const { data: html } = await axios.get(link, {
      headers: { 'User-Agent': USER_AGENT, Referer: `${ANIWATCH_BASE_URL}/` },
      timeout: 15000,
    });

    const extract = (pattern) => String(html).match(pattern)?.[1] ?? null;

    const clientKey =
      extract(/window\._xy_ws\s*=\s*['"`]([A-Za-z0-9]+)['"`]/) ||
      extract(/<meta\s+name=['"]_gg_fb['"]\s+content=['"]([A-Za-z0-9]+)['"]/i) ||
      extract(/_is_th:([A-Za-z0-9]+)/) ||
      (() => {
        const x = extract(/x\s*:\s*['"]([A-Za-z0-9]+)['"]/i);
        const y = extract(/y\s*:\s*['"]([A-Za-z0-9]+)['"]/i);
        const z = extract(/z\s*:\s*['"]([A-Za-z0-9]+)['"]/i);
        return x && y && z ? `${x}${y}${z}` : x ?? y ?? z ?? null;
      })();

    if (!clientKey) {
      console.error('[getMegaCloudSources] Client key not found');
      return null;
    }

    const url = new URL(link);
    const pathMatch = url.pathname.match(/\/embed-2\/([^/]+\/)?e-1\//);
    const versionPath = pathMatch?.[0] ?? '/embed-2/v3/e-1/';

    const { data } = await axios.get(
      `https://${url.hostname}${versionPath}getSources?id=${encodeURIComponent(id)}&_k=${encodeURIComponent(clientKey)}`,
      {
        headers: { 'User-Agent': USER_AGENT, 'X-Requested-With': 'XMLHttpRequest', Referer: link },
        timeout: 15000,
      }
    );
    return data;
  });
}

async function resolveIframeSources(iframeLink) {
  if (!iframeLink) return null;
  return iframeLink.includes('megacloud.')
    ? getMegaCloudSources(iframeLink)
    : getRapidCloudSources(iframeLink);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function getStreamingServer({ animeEpisodeId, ep, server = 'megacloud', category = 'sub' }) {
  if (!animeEpisodeId || ep == null || ep === '') {
    return { status: 400, message: 'Missing required parameters: animeEpisodeId and ep' };
  }

  const sanitizedCategory = String(category).toLowerCase().trim() === 'dub' ? 'dub' : 'sub';
  const requestedServerName = normalizeServerName(server);
  const watchUrl = `${ANIWATCH_BASE_URL}/watch/${animeEpisodeId}?ep=${ep}`;

  console.log('[getStreamingServer]', { animeEpisodeId, ep, server: requestedServerName, category: sanitizedCategory });

  try {
    // 1. Grab watch page cookies
    const { headers } = await axios.get(watchUrl, {
      headers: { 'User-Agent': USER_AGENT, Referer: ANIWATCH_BASE_URL },
      timeout: 15000,
    });
    const cookieHeader = (headers?.['set-cookie'] ?? [])
      .map((c) => c.split(';')[0])
      .join('; ');

    // 2. Fetch server list
    const serversResponse = await axios.get(
      `${ANIWATCH_AJAX_URL}/episode/servers?episodeId=${encodeURIComponent(ep)}`,
      { headers: buildAjaxHeaders(watchUrl, cookieHeader), timeout: 15000 }
    );

    if (!serversResponse.data?.status || !serversResponse.data?.html) {
      return { status: 502, message: 'Failed to fetch Aniwatch server list', data: serversResponse.data ?? null };
    }

    const $ = load(serversResponse.data.html);
    let serverCandidates = collectServerCandidates($, sanitizedCategory);

    // Fallback: collect from any .server-item if category-specific list is empty
    if (!serverCandidates.length) {
      $('.server-item').each((_, el) => {
        const serverName = $(el).find('a').text().toLowerCase().trim();
        const serverId = Number($(el).attr('data-id') || $(el).attr('data-server-id')) || null;
        if (serverName && serverId) serverCandidates.push({ serverName, serverId });
      });
    }

    if (!serverCandidates.length) {
      return { status: 404, message: 'No streaming servers found on Aniwatch page' };
    }

    const selectedServer =
      serverCandidates.find((s) => s.serverName.includes(requestedServerName)) ?? serverCandidates[0];

    // 3. Fetch iframe source for selected server
    const { data: sourceData } = await axios.get(
      `${ANIWATCH_AJAX_URL}/episode/sources?id=${selectedServer.serverId}`,
      { headers: buildAjaxHeaders(watchUrl, cookieHeader), timeout: 15000 }
    );

    const iframeLink = sourceData?.type === 'iframe' ? sourceData.link : null;
    const rapidSources = await resolveIframeSources(iframeLink);

    // 4. Collect m3u8 links & tracks
    const m3u8Links = Array.from(collectM3u8Links([sourceData, rapidSources]));
    let tracks = normalizeTracks(rapidSources?.tracks);

    // 5. Fallback: fetch sub-server tracks for dub when none found
    if (!tracks.length && sanitizedCategory === 'dub') {
      const subCandidates = collectServerCandidates($, 'sub');
      const subServer = subCandidates.find((s) => s.serverName.includes(requestedServerName))
        ?? subCandidates[0]
        ?? null;

      if (subServer && subServer.serverId !== selectedServer.serverId) {
        const { data: subSourceData } = await axios.get(
          `${ANIWATCH_AJAX_URL}/episode/sources?id=${subServer.serverId}`,
          { headers: buildAjaxHeaders(watchUrl, cookieHeader), timeout: 15000 }
        );
        const subIframeLink = subSourceData?.type === 'iframe' ? subSourceData.link : null;
        const subSources = await resolveIframeSources(subIframeLink);
        const fallbackTracks = normalizeTracks(subSources?.tracks);
        if (fallbackTracks.length) {
          tracks = fallbackTracks;
          console.log('[getStreamingServer] Tracks fallback: using sub server tracks');
        }
      }
    }

    if (m3u8Links.length) {
      m3u8Links.forEach((url, i) => console.log(`[getStreamingServer] M3U8 [${i + 1}]: ${url}`));
    } else {
      console.log('[getStreamingServer] No direct .m3u8 URL found in source payload');
    }

    return {
      watchUrl,
      episodeId: animeEpisodeId,
      episodeNo: Number(ep),
      category: sanitizedCategory,
      server: { serverName: selectedServer.serverName, serverId: selectedServer.serverId },
      type: m3u8Links.length ? 'm3u8' : (sourceData?.type ?? 'iframe'),
      source: m3u8Links[0] ?? sourceData?.link ?? null,
      tracks,
      skip: {
        intro: rapidSources?.intro?.end > 1 ? rapidSources.intro : null,
        outro: rapidSources?.outro?.end > 1 ? rapidSources.outro : null,
      },
    };
  } catch (error) {
    console.error('[getStreamingServer] Fatal error:', error.message);
    return { status: 500, message: 'Failed to fetch streaming server data from Aniwatch', error: error.message };
  }
}

export { getStreamingServer };