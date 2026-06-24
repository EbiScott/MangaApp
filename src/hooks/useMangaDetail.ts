// src/hooks/useMangaDetail.ts
import { useQuery } from '@tanstack/react-query';
import { sourceRegistry } from '../services/sources';
import { Manga, Chapter } from '../types';

// This hook accepts the mangaId and sourceId from navigation params
// and returns everything the MangaDetail screen needs.
export function useMangaDetail(mangaId: string, sourceId: string) {
  // Get the source from the registry
  const source = sourceRegistry.getSource(sourceId);

  // ── Manga Details Query ──
  // Fetches the manga's title, cover, description, genres, status
  const mangaQuery = useQuery({
    // The queryKey includes mangaId so each manga gets its own cache entry.
    // If you visit the same manga twice, the second visit is instant
    // because TanStack Query returns the cached result.
    queryKey: ['manga', 'detail', sourceId, mangaId],
    queryFn: async () => {
      if (!source) throw new Error(`Source not found: ${sourceId}`);

      // We build the manga URL from the mangaId.
      // MangaDex detail URLs look like: https://mangadex.org/title/abc-123
      const mangaUrl = `${source.baseUrl}/title/${mangaId}`;
      return source.getMangaDetails(mangaUrl);
    },
    // Only run if we actually have a source
    enabled: !!source,
  });

  // ── Chapter List Query ──
  // Fetches all chapters for this manga.
  // We make this a separate query from manga details because:
  // 1. Chapters can be many hundreds of items — fetching them separately
  //    means the manga info appears fast while chapters load in parallel
  // 2. We might want to refresh chapters independently later
  const chaptersQuery = useQuery({
    queryKey: ['manga', 'chapters', sourceId, mangaId],
    queryFn: async () => {
      if (!source) throw new Error(`Source not found: ${sourceId}`);
      const mangaUrl = `${source.baseUrl}/title/${mangaId}`;
      return source.getChapterList(mangaUrl);
    },
    // Don't start fetching chapters until we have the manga details.
    // 'mangaQuery.isSuccess' is true once the first query has finished.
    // This way both queries run in sequence, not simultaneously,
    // which avoids hammering the API at the same time.
    enabled: !!source && mangaQuery.isSuccess,
  });

  return {
    // Manga details
    manga: mangaQuery.data,
    isMangaLoading: mangaQuery.isLoading,
    mangaError: mangaQuery.error,

    // Chapter list
    chapters: chaptersQuery.data ?? [],
    isChaptersLoading: chaptersQuery.isLoading,
    chaptersError: chaptersQuery.error,

    // A combined loading state — true if EITHER query is still running.
    // The '||' means "or" — true if the left OR right side is true.
    isLoading: mangaQuery.isLoading || chaptersQuery.isLoading,
  };
}