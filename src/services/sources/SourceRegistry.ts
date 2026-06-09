// src/services/sources/SourceRegistry.ts
import { MangaSource, SourceCategory } from '../../types';

// This class manages all available sources in the app.
// It's a "singleton" — there's only ever one instance of it.
class SourceRegistry {
  // A Map is like an object but designed for key-value lookups.
  // Key: source ID (string), Value: the source itself (MangaSource)
  private sources: Map<string, MangaSource> = new Map();

  // Add a source to the registry
  register(source: MangaSource): void {
    this.sources.set(source.id, source);
    console.log(`[Registry] Registered source: ${source.name}`);
  }

  // Get one specific source by its ID
  getSource(id: string): MangaSource | undefined {
    return this.sources.get(id);
  }

  // Get ALL sources
  getAllSources(): MangaSource[] {
    return Array.from(this.sources.values());
  }

  // Get sources filtered by category (e.g. only 'manhwa' sources)
  getSourcesByCategory(category: SourceCategory): MangaSource[] {
    return this.getAllSources().filter(source => source.category === category);
  }

  // Get sources filtered by language
  getSourcesByLanguage(language: string): MangaSource[] {
    return this.getAllSources().filter(source => source.language === language);
  }
}

// We export a single shared instance — not the class itself.
// This means everywhere in your app that imports this file
// gets the SAME registry with the SAME sources registered.
export const sourceRegistry = new SourceRegistry();