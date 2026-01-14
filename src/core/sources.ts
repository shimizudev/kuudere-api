import { kuudereApi } from '../client';
import { Zencloud } from '../extractor/zencloud';
import { formatSources } from '../helpers/format';
import type { VideoSource, Subtitle, IntroOutro } from '../helpers/types';
import type { KuudereWatchResponse } from './types';

export const kuudereSources = async (id: string, subType: 'sub' | 'dub' = 'sub') => {
  const [animeId, episodeNumber] = decodeURIComponent(id).split('?n=');

  if (!animeId || !episodeNumber) throw new Error('Invalid ID format.');

  const response = await kuudereApi(
    `watch/${animeId}/${episodeNumber}`
  ).json<KuudereWatchResponse>();

  let links = response.episode_links;

  links = links.filter(link => link.dataType === subType);
  links = links.filter(link => link.serverName.toLowerCase() === 'zen');

  const videoSources: Partial<VideoSource>[] = [];
  let subtitles: Partial<Subtitle>[] = [];
  let intro: IntroOutro | undefined;
  let outro: IntroOutro | undefined;
  let thumbnails: string | undefined;

  await Promise.all(
    links.map(async link => {
      const data = await Zencloud.getSources(link.dataLink);

      videoSources.push({
        url: data.url,
        isM3U8: data.url.includes('.m3u8'),
        quality: 'auto',
        isDub: link.dataType === 'dub',
      });

      if (subtitles.length === 0 && data.subtitles) {
        subtitles = data.subtitles.map(sub => ({
          url: sub.url,
          label: sub.language,
          srcLang: sub.language,
        }));
      }

      if (!intro && data.intro_chapter) {
        const introData = data.intro_chapter as {
          start: number;
          end: number;
        };
        intro = { start: introData.start, end: introData.end };
      }

      if (!outro && data.outro_chapter) {
        const outroData = data.outro_chapter as {
          start: number;
          end: number;
        };
        outro = { start: outroData.start, end: outroData.end };
      }

      if (!thumbnails && data.thumbnails_vtt) {
        thumbnails = data.thumbnails_vtt;
      }
    })
  );

  return formatSources({
    sources: videoSources,
    subtitles,
    intro,
    outro,
    thumbnails,
  });
};
