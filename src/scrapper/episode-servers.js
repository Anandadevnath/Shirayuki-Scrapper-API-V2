import { load, axios } from '../utils/scrapper-deps.js';
import { SRC_BASE_URL, USER_AGENT } from '../utils/constants.js';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;

export async function getEpisodeServers(animeEpisodeId) {
  const res = {
    sub: [],
    dub: [],
    episodeId: animeEpisodeId,
    episodeNo: 0,
  };

  try {
    if (animeEpisodeId.trim() === '' || animeEpisodeId.indexOf('?ep=') === -1) {
      throw new Error('Invalid anime episode id');
    }

    const epId = animeEpisodeId.split('?ep=')[1];

    const { data } = await axios.get(
      `${SRC_AJAX_URL}/v2/episode/servers?episodeId=${epId}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${SRC_BASE_URL}/watch/${animeEpisodeId}`,
        },
      }
    );

    const $ = load(data.html);

    res.episodeNo = Number($('.server-notice strong').text().split(' ').pop()) || 0;

    $('.ps_-block.ps_-block-sub.servers-sub .ps__-list .server-item').each((_, el) => {
      const serverName = $(el).find('a').text().toLowerCase().trim();
      res.sub.push({
        serverName: serverName,
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    $('.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item').each((_, el) => {
      const serverName = $(el).find('a').text().toLowerCase().trim();
      res.dub.push({
        serverName: serverName,
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    return res;
  } catch (error) {
    throw new Error(`Failed to get episode servers: ${error.message}`);
  }
}
