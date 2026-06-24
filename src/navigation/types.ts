// src/navigation/types.ts
export type RootStackParamList = {
  // --- Tab root screens ---
  Home: undefined;
  Browse: undefined;        // This is now the SourceListScreen
  Library: undefined;
  Settings: undefined;

  // --- Drill-down screens ---
  SourceBrowse: {           // NEW — browsing one specific source
    sourceId: string;       // Which source the user tapped
  };
  MangaDetail: {
    mangaId: string;
    sourceId: string;
  };
  Reader: {
    mangaId: string;
    chapterId: string;
    chapterNumber: number;
  };
};

export type TabParamList = {
  HomeTab: undefined;
  BrowseTab: undefined;
  LibraryTab: undefined;
  SettingsTab: undefined;
};