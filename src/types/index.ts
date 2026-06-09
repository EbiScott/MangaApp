// ─────────────────────────────────────────
// CORE DATA TYPES
// ─────────────────────────────────────────

// Represents a manga title (from search results or browse)
export interface Manga {
  id: string;           // Unique ID within the source
  title: string;
  coverUrl: string;
  description: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'unknown';
  genres: string[];
  sourceId: string;     // Which source this manga came from
  url: string;          // The actual URL on the source website
}

// Represents one chapter of a manga
export interface Chapter {
  id: string;
  mangaId: string;
  title: string;
  chapterNumber: number;
  uploadDate: string;
  url: string;          // The URL to this chapter's page list
}

// Represents one page (image) inside a chapter
export interface Page {
  index: number;
  imageUrl: string;
}

// ─────────────────────────────────────────
// SOURCE TYPES
// ─────────────────────────────────────────

// The category of content a source provides
export type SourceCategory = 'manga' | 'manhwa' | 'manhua' | 'comics';

// Basic info about a source (used for listing/browsing sources)
export interface SourceInfo {
  id: string;
  name: string;
  baseUrl: string;
  language: string;
  category: SourceCategory;
  iconUrl: string;
  isNsfw: boolean;
}

// ─────────────────────────────────────────
// THE SOURCE INTERFACE — THE HEART OF THE APP
// ─────────────────────────────────────────

// Every single source (MangaDex, MangaFire, etc.) MUST implement
// all of these methods. This is the "contract" every source signs.
export interface MangaSource extends SourceInfo {
  // Search for manga by a text query
  search(query: string, page: number): Promise<Manga[]>;

  // Get the popular/trending manga for this source
  getPopular(page: number): Promise<Manga[]>;

  // Get the latest updated manga for this source
  getLatest(page: number): Promise<Manga[]>;

  // Get full details for a specific manga (description, genres, chapters)
  getMangaDetails(mangaUrl: string): Promise<Manga>;

  // Get the list of chapters for a manga
  getChapterList(mangaUrl: string): Promise<Chapter[]>;

  // Get the image URLs for every page in a chapter
  getPageList(chapterUrl: string): Promise<Page[]>;
}