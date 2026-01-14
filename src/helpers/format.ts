import { kuudereApi } from '../client';
import type { KuudereSearchResponse, KuudereWatchResponse } from '../core/types';
import type {
  FormatEpisode,
  FormatSearchAnime,
  FormatSearchPagination,
  FormatSearchResponse,
  Source,
} from './types';

export const formatSearch = (response: KuudereSearchResponse) => {
  const mappedResults: FormatSearchAnime[] = response.results.map(result => ({
    title: result.title,
    image: result.coverImage,
    id: result.id,
    year: Number.parseInt(result.details.split('•')[0]?.trim() as string, 10),
    format: result.details.split('•')[1]?.trim(),
  }));

  const pagination: FormatSearchPagination = {
    hasMore: response.hasMore,
    total: response.total,
    displayed: response.displayed,
  };

  const searchResponse: FormatSearchResponse = {
    pagination,
    results: mappedResults,
  };

  return searchResponse;
};

export const formatEpisodes = async (animeId: string, response: KuudereWatchResponse) => {
  type Input = Record<string, string>;

  type OutputItem = {
    number: string;
    url: string;
  };

  function convert(input: Input): OutputItem[] {
    return Object.entries(input).map(([number, url]) => ({
      number,
      url,
    }));
  }

  const thumbnailsResponse = await kuudereApi(
    `thumbnails/${(response.anime_info as { anilist: number }).anilist}`
  ).json<{
    thumbnails: { [key: string]: string };
  }>();

  const mappedThumbnails = convert(thumbnailsResponse.thumbnails);

  const mappedEpisodes: FormatEpisode[] = response.all_episodes.map(episode => {
    const thumbnail = mappedThumbnails.find(n => Number(n.number) === Number(episode.number));

    return {
      id: encodeURIComponent(`${animeId}?n=${episode.number}`),
      title: episode.titles[0] ?? null,
      image: thumbnail?.url ?? null,
      number: episode.number,
      isFiller: episode.filler,
      isRecap: episode.recap,
      aired: episode.aired,
      score: episode.score,
      ago: episode.ago,
    };
  });

  return mappedEpisodes.reverse();
};

export function formatSources<T = unknown>(input: Partial<Source<T>>): Source<T> {
  return {
    headers: input.headers,
    intro: input.intro,
    outro: input.outro,
    sources: input.sources ?? [],
    subtitles: input.subtitles,
    download: input.download,
    chapters: input.chapters,
    thumbnails: input.thumbnails,
    metadata: input.metadata,
  };
}
