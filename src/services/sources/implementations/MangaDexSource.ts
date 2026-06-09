// src/services/sources/implementations/MangaDexSource.ts
import { BaseSource } from '../BaseSource';
import { Manga, Chapter, Page } from '../../../types';

// MangaDex's API base URL — all API calls go here
const API_BASE = 'https://api.mangadex.org';

// MangaDex returns cover art as a separate object.
// We need this helper to build the full image URL.
function buildCoverUrl(mangaId: string, filename: string): string {
  return `https://uploads.mangadex.org/covers/${mangaId}/${filename}.256.jpg`;
}

export class MangaDexSource extends BaseSource {
  // ── Source Info ──
  id = 'mangadex';
  name = 'MangaDex';
  baseUrl = 'https://mangadex.org';
  language = 'en';
  category = 'manga' as const; // 'as const' tells TypeScript this is
                                // the exact string 'manga', not just any string
  iconUrl = 'https://mangadex.org/favicon.ico';
  isNsfw = false;

  // ── API Response Types ──
  // MangaDex's API returns data in a specific shape.
  // We define that shape here so TypeScript can help us use it correctly.
  // These are "private" because only this class needs them.
  private parseMangaFromResponse(item: any): Manga {
    // MangaDex stores manga attributes in item.attributes
    const attrs = item.attributes;

    // The title might be in different languages — try English first, then any
    const title =
      attrs.title.en ||
      Object.values(attrs.title)[0] ||
      'Unknown Title';

    // Description — same multilanguage pattern
    const description =
      attrs.description?.en ||
      Object.values(attrs.description || {})[0] ||
      'No description available.';

    // Find the cover art relationship
    // MangaDex returns related objects (like covers) inside a 'relationships' array
    const coverRelation = item.relationships?.find(
      (r: any) => r.type === 'cover_art'
    );
    const coverFilename = coverRelation?.attributes?.fileName || '';
    const coverUrl = coverFilename
      ? buildCoverUrl(item.id, coverFilename)
      : '';

    // Map MangaDex's status strings to our own status type
    const statusMap: Record<string, Manga['status']> = {
      ongoing: 'ongoing',
      completed: 'completed',
      hiatus: 'hiatus',
      cancelled: 'unknown',
    };

    // Extract genres from the tags array
    const genres = (attrs.tags || [])
      .filter((tag: any) => tag.attributes?.group === 'genre')
      .map((tag: any) => tag.attributes?.name?.en || '')
      .filter(Boolean); // Remove any empty strings

    return {
      id: item.id,
      title: title as string,
      coverUrl,
      description: description as string,
      status: statusMap[attrs.status] || 'unknown',
      genres,
      sourceId: this.id,
      url: `${this.baseUrl}/title/${item.id}`,
    };
  }

  // ── Required Methods ──

  async getPopular(page: number): Promise<Manga[]> {
    const offset = (page - 1) * 20; // 20 results per page

    // This is the MangaDex API URL for popular manga
    // 'includes[]' tells the API to also return cover art data
    // 'order[followedCount]' sorts by most followed (= most popular)
    const url =
      `${API_BASE}/manga?limit=20&offset=${offset}` +
      `&includes[]=cover_art&includes[]=author` +
      `&order[followedCount]=desc` +
      `&contentRating[]=safe&contentRating[]=suggestive`;

    const data = await this.fetchJson<any>(url);
    return data.data.map((item: any) => this.parseMangaFromResponse(item));
  }

  async getLatest(page: number): Promise<Manga[]> {
    const offset = (page - 1) * 20;

    // Same as popular but sorted by latest upload date
    const url =
      `${API_BASE}/manga?limit=20&offset=${offset}` +
      `&includes[]=cover_art` +
      `&order[latestUploadedChapter]=desc` +
      `&contentRating[]=safe&contentRating[]=suggestive`;

    const data = await this.fetchJson<any>(url);
    return data.data.map((item: any) => this.parseMangaFromResponse(item));
  }

  async search(query: string, page: number): Promise<Manga[]> {
    const offset = (page - 1) * 20;

    // encodeURIComponent makes the search query URL-safe
    // (e.g. spaces become %20)
    const url =
      `${API_BASE}/manga?limit=20&offset=${offset}` +
      `&title=${encodeURIComponent(query)}` +
      `&includes[]=cover_art` +
      `&contentRating[]=safe&contentRating[]=suggestive`;

    const data = await this.fetchJson<any>(url);
    return data.data.map((item: any) => this.parseMangaFromResponse(item));
  }

  async getMangaDetails(mangaUrl: string): Promise<Manga> {
    // Extract the manga ID from the URL
    // e.g. 'https://mangadex.org/title/abc-123' → 'abc-123'
    const mangaId = mangaUrl.split('/title/')[1];

    const url =
      `${API_BASE}/manga/${mangaId}` +
      `?includes[]=cover_art&includes[]=author&includes[]=artist`;

    const data = await this.fetchJson<any>(url);
    return this.parseMangaFromResponse(data.data);
  }

  async getChapterList(mangaUrl: string): Promise<Chapter[]> {
    const mangaId = mangaUrl.split('/title/')[1];
    const chapters: Chapter[] = [];
    let offset = 0;
    const limit = 100; // Fetch 100 chapters at a time

    // MangaDex paginates chapters, so we loop until we have them all
    while (true) {
      const url =
        `${API_BASE}/manga/${mangaId}/feed` +
        `?limit=${limit}&offset=${offset}` +
        `&translatedLanguage[]=en` +
        `&order[chapter]=desc`; // Most recent first

      const data = await this.fetchJson<any>(url);

      if (!data.data || data.data.length === 0) {
        break; // No more chapters, stop the loop
      }

      const pageChapters = data.data.map((item: any): Chapter => ({
        id: item.id,
        mangaId,
        title: item.attributes.title || `Chapter ${item.attributes.chapter}`,
        chapterNumber: parseFloat(item.attributes.chapter) || 0,
        uploadDate: item.attributes.publishAt,
        url: `${this.baseUrl}/chapter/${item.id}`,
      }));

      chapters.push(...pageChapters); // '...' spreads the array into the push
      offset += limit;

      // If we got fewer results than the limit, we've reached the end
      if (data.data.length < limit) break;
    }

    return chapters;
  }

  async getPageList(chapterUrl: string): Promise<Page[]> {
    // Extract chapter ID from URL
    const chapterId = chapterUrl.split('/chapter/')[1];

    // MangaDex's 'at-home' endpoint gives us the image server and filenames
    const url = `${API_BASE}/at-home/server/${chapterId}`;
    const data = await this.fetchJson<any>(url);

    const serverUrl = data.baseUrl;
    const hash = data.chapter.hash;
    const pageFilenames: string[] = data.chapter.data; // Array of image filenames

    // Build full image URLs from the server info + filenames
    return pageFilenames.map((filename, index): Page => ({
      index,
      imageUrl: `${serverUrl}/data/${hash}/${filename}`,
    }));
  }
}