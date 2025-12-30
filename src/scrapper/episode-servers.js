import { load } from 'cheerio';
import axios from 'axios';

const SRC_BASE_URL = 'https://hianimez.to';
const SRC_AJAX_URL = `${SRC_BASE_URL}/ajax`;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

export async function getEpisodeServers(animeEpisodeId) {
  const res = {
    sub: [],
    dub: [],
    raw: [],
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
      res.sub.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    $('.ps_-block.ps_-block-sub.servers-dub .ps__-list .server-item').each((_, el) => {
      res.dub.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    $('.ps_-block.ps_-block-sub.servers-raw .ps__-list .server-item').each((_, el) => {
      res.raw.push({
        serverName: $(el).find('a').text().toLowerCase().trim(),
        serverId: Number($(el)?.attr('data-server-id')?.trim()) || null,
      });
    });

    return res;
  } catch (error) {
    throw new Error(`Failed to get episode servers: ${error.message}`);
  }
}
