import { load, axios } from '../utils/scrapper-deps.js';
import { USER_AGENT } from '../utils/constants.js';

const KAIDO_BASE_URL = 'https://kaido.to';
const KAIDO_AJAX_URL = `${KAIDO_BASE_URL}/ajax`;

function normalizeServerName(server = 'vidcloud') {
  const value = String(server).toLowerCase().trim();
  const serverMap = {
    'hd-1': 'vidstreaming',
    'hd-2': 'vidcloud',
    'vidcloud': 'vidcloud',
    'vidstreaming': 'vidstreaming',
    'mycloud': 'mycloud',
  };

  return serverMap[value] || value;
}

function collectM3u8Links(value, output = new Set()) {
  if (!value) return output;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.includes('.m3u8')) {
      output.add(trimmed);
    }
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectM3u8Links(item, output));
    return output;
  }

  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectM3u8Links(item, output));
  }

  return output;
}

function normalizeTracks(tracks) {
  if (!Array.isArray(tracks)) return [];

  return tracks
    .filter((track) => track && typeof track === 'object' && track.file)
    .map((track) => ({
      url: track.file,
      label: track.label || null,
      kind: track.kind || null,
      default: Boolean(track.default),
    }));
}

function getIframeIdFromLink(link) {
  if (!link || typeof link !== 'string') return null;
  const match = link.match(/\/e-1\/([^/?]+)/i);
  return match?.[1] || null;
}

function collectServerCandidates($, category) {
  const serverCandidates = [];

  $(`.servers-${category} .server-item`).each((_, el) => {
    const serverName = $(el).find('a').text().toLowerCase().trim();
    const serverId = Number($(el).attr('data-id') || $(el).attr('data-server-id')) || null;
    if (serverName && serverId) {
      serverCandidates.push({ serverName, serverId });
    }
  });

  return serverCandidates;
}

async function getRapidCloudSources(iframeLink) {
  const iframeId = getIframeIdFromLink(iframeLink);
  if (!iframeId) return null;

  try {
    const iframeUrl = new URL(iframeLink);
    const pathMatch = iframeUrl.pathname.match(/\/embed-2\/([^/]+\/)?e-1\//);
    const versionPath = pathMatch ? pathMatch[0] : '/embed-2/ajax/e-1/';

    const rapidSourcesResponse = await axios.get(
      `https://${iframeUrl.hostname}${versionPath}getSources?id=${encodeURIComponent(iframeId)}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': iframeLink,
        },
        timeout: 15000,
      }
    );

    return rapidSourcesResponse.data;
  } catch (error) {
    console.error('[getStreamingServer] Rapid-cloud source error:', error.message);
    return null;
  }
}

async function getStreamingServer({ animeEpisodeId, ep, server = 'vidcloud', category = 'sub' }) {
  if (!animeEpisodeId || ep === undefined || ep === null || ep === '') {
    console.error('[getStreamingServer] Missing parameters:', { animeEpisodeId, ep, server, category });
    return {
      status: 400,
      message: 'Missing required parameters: animeEpisodeId and ep',
    };
  }

  const sanitizedCategory = String(category).toLowerCase().trim() === 'dub' ? 'dub' : 'sub';
  const requestedServerName = normalizeServerName(server);
  const watchUrl = `${KAIDO_BASE_URL}/watch/${animeEpisodeId}?ep=${ep}`;

  console.log('[getStreamingServer] Params:', {
    animeEpisodeId,
    ep,
    server: requestedServerName,
    category: sanitizedCategory,
  });
  console.log('[getStreamingServer] Watch URL:', watchUrl);

  try {
    const watchResponse = await axios.get(watchUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': KAIDO_BASE_URL,
      },
      timeout: 15000,
    });

    const rawCookies = watchResponse.headers?.['set-cookie'] || [];
    const cookieHeader = rawCookies.map((cookie) => cookie.split(';')[0]).join('; ');

    const serversResponse = await axios.get(
      `${KAIDO_AJAX_URL}/episode/servers?episodeId=${encodeURIComponent(ep)}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': watchUrl,
          ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
        },
        timeout: 15000,
      }
    );

    if (!serversResponse.data?.status || !serversResponse.data?.html) {
      return {
        status: 502,
        message: 'Failed to fetch Kaido server list',
        data: serversResponse.data || null,
      };
    }

    const $ = load(serversResponse.data.html);
    const serverCandidates = collectServerCandidates($, sanitizedCategory);

    if (!serverCandidates.length) {
      $('.server-item').each((_, el) => {
        const serverName = $(el).find('a').text().toLowerCase().trim();
        const serverId = Number($(el).attr('data-id') || $(el).attr('data-server-id')) || null;
        if (serverName && serverId) {
          serverCandidates.push({ serverName, serverId });
        }
      });
    }

    if (!serverCandidates.length) {
      return {
        status: 404,
        message: 'No streaming servers found on Kaido page',
      };
    }

    const selectedServer =
      serverCandidates.find((item) => item.serverName.includes(requestedServerName)) ||
      serverCandidates[0];

    const sourceResponse = await axios.get(
      `${KAIDO_AJAX_URL}/episode/sources?id=${selectedServer.serverId}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': watchUrl,
          ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
        },
        timeout: 15000,
      }
    );

    const rapidSources =
      sourceResponse.data?.type === 'iframe' && sourceResponse.data?.link
        ? await getRapidCloudSources(sourceResponse.data.link)
        : null;

    if (sourceResponse.data?.type === 'iframe' && sourceResponse.data?.link) {
      console.log('[getStreamingServer] Iframe source:', sourceResponse.data.link);
    }

    if (rapidSources) {
      console.log('[getStreamingServer] Rapid-cloud source payload received');
    }

    const m3u8Links = Array.from(collectM3u8Links([sourceResponse.data, rapidSources]));
    let tracks = normalizeTracks(rapidSources?.tracks);
    let trackSourceCategory = sanitizedCategory;

    if (!tracks.length && sanitizedCategory === 'dub') {
      const subServerCandidates = collectServerCandidates($, 'sub');
      const subServer =
        subServerCandidates.find((item) => item.serverName.includes(requestedServerName)) ||
        subServerCandidates[0] ||
        null;

      if (subServer && subServer.serverId !== selectedServer.serverId) {
        const subSourceResponse = await axios.get(
          `${KAIDO_AJAX_URL}/episode/sources?id=${subServer.serverId}`,
          {
            headers: {
              'User-Agent': USER_AGENT,
              'X-Requested-With': 'XMLHttpRequest',
              'Referer': watchUrl,
              ...(cookieHeader ? { 'Cookie': cookieHeader } : {}),
            },
            timeout: 15000,
          }
        );

        const subRapidSources =
          subSourceResponse.data?.type === 'iframe' && subSourceResponse.data?.link
            ? await getRapidCloudSources(subSourceResponse.data.link)
            : null;

        const fallbackTracks = normalizeTracks(subRapidSources?.tracks);
        if (fallbackTracks.length) {
          tracks = fallbackTracks;
          trackSourceCategory = 'sub';
          console.log('[getStreamingServer] Tracks fallback: using sub server tracks');
        }
      }
    }

    if (m3u8Links.length) {
      console.log('[getStreamingServer] M3U8 URL(s):');
      m3u8Links.forEach((url, index) => {
        console.log(`  [${index + 1}] ${url}`);
      });
    } else {
      console.log('[getStreamingServer] No direct .m3u8 URL found in source payload');
    }

    const skip = [];
    if (rapidSources?.intro?.end > 1) {
      skip.push({ type: 'intro', start: rapidSources.intro.start, end: rapidSources.intro.end });
    }
    if (rapidSources?.outro?.end > 1) {
      skip.push({ type: 'outro', start: rapidSources.outro.start, end: rapidSources.outro.end });
    }

    return {
      status: 200,
      message: 'Successful',
      video: {
        type: 'm3u8',
        source: {
          url: m3u8Links[0] || null,
          urls: m3u8Links,
          viaProxy: false,
        },
        watchUrl,
        episodeId: animeEpisodeId,
        episodeNo: Number(ep),
        category: sanitizedCategory,
        server: selectedServer,
      },
      captions: {
        tracks: tracks.map((track) => ({
          file: track.url,
          label: track.label,
          kind: track.kind,
          default: track.default,
        })),
      },
      skip,
      trackSourceCategory,
      raw: {
        source: sourceResponse.data,
        rapidSource: rapidSources,
      },
    };
  } catch (error) {
    console.error('[getStreamingServer] Error fetching from Kaido:', error.message);
    return {
      status: 500,
      message: 'Failed to fetch streaming server data from Kaido',
      error: error.message,
    };
  }
}

export { getStreamingServer };