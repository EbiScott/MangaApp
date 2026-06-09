// src/services/sources/index.ts
import { sourceRegistry } from './SourceRegistry';
import { MangaDexSource } from './implementations/MangaDexSource';

// Create one instance of each source and register it
sourceRegistry.register(new MangaDexSource());

// Later, you'll add more sources here:
// sourceRegistry.register(new MangaFireSource());
// sourceRegistry.register(new MangaKakalotSource());

// Export the registry so the rest of the app can use it
export { sourceRegistry };