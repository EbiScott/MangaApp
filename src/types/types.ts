// This defines what parameters each screen in a stack can receive.
// 'undefined' means the screen expects NO parameters.

// The stack that lives inside each tab
export type RootStackParamList = {
  Home: undefined;           // No params needed
  Browse: undefined;         // No params needed
  Library: undefined;        // No params needed
  Settings: undefined;       // No params needed
  MangaDetail: {            // This screen DOES need params:
    mangaId: string;         //   - the manga's ID
    sourceId: string;        //   - which source it came from
  };
  Reader: {                 // This screen needs:
    mangaId: string;         //   - the manga's ID
    chapterId: string;       //   - which chapter to open
    chapterNumber: number;   //   - the chapter number (for display)
  };
};

// The bottom tab navigator's screen list
export type TabParamList = {
  HomeTab: undefined;
  BrowseTab: undefined;
  LibraryTab: undefined;
  SettingsTab: undefined;
};