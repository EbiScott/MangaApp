import { MangaSource, SourceCategory } from '../../types';

// 'abstract class' means you can't use this class directly —
// you can only use it as a starting point for other classes.
// Think of it as a blueprint, not a building.
export abstract class BaseSource implements MangaSource {
  // These properties must be set by each source that extends this class
  abstract id: string;
  abstract name: string;
  abstract baseUrl: string;
  abstract language: string;
  abstract category: SourceCategory;
  abstract iconUrl: string;
  abstract isNsfw: boolean;

  // These methods must be implemented by each source
  abstract search(query: string, page: number): Promise<import('../../types').Manga[]>;
  abstract getPopular(page: number): Promise<import('../../types').Manga[]>;
  abstract getLatest(page: number): Promise<import('../../types').Manga[]>;
  abstract getMangaDetails(mangaUrl: string): Promise<import('../../types').Manga>;
  abstract getChapterList(mangaUrl: string): Promise<import('../../types').Chapter[]>;
  abstract getPageList(chapterUrl: string): Promise<import('../../types').Page[]>;

  // ── SHARED HELPER METHODS ──
  // These are NOT abstract — they're real working methods that
  // all sources inherit and can use for free.

  // Makes an HTTP GET request and returns the response text (HTML)
  protected async fetchHtml(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          // We tell the server we're a browser so it doesn't block us
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        // response.ok is false if the server returned an error (like 404 or 500)
        throw new Error(`HTTP error: ${response.status} for URL: ${url}`);
      }

      return await response.text(); // Return the raw HTML as a string
    } catch (error) {
      console.error(`[${this.name}] Failed to fetch ${url}:`, error);
      throw error; // Re-throw so the calling code knows it failed
    }
  }

  // Makes an HTTP GET request and returns parsed JSON
  protected async fetchJson<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status} for URL: ${url}`);
      }

      // The <T> here is a TypeScript "generic" — it means "whatever type
      // the caller expects, return that type". So fetchJson<Manga[]> would
      // return a Manga array. We'll see this in action when we use it.
      return await response.json() as T;
    } catch (error) {
      console.error(`[${this.name}] Failed to fetch JSON from ${url}:`, error);
      throw error;
    }
  }

  // Builds a full URL from a path. Useful because source websites
  // sometimes return relative paths like '/manga/123' instead of
  // full URLs like 'https://example.com/manga/123'
  protected buildUrl(path: string): string {
    if (path.startsWith('http')) {
      return path; // Already a full URL
    }
    return `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}