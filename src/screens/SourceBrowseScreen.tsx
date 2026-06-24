// src/screens/SourceBrowseScreen.tsx
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,  // Hook to get screen dimensions
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useState, useCallback, useMemo } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useInfiniteQuery } from '@tanstack/react-query';
import { sourceRegistry } from '../services/sources';
import { Manga } from '../types';
import MangaCard from '../components/MangaCard';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'SourceBrowse'>;
type BrowseMode = 'popular' | 'latest' | 'search';

// How many cards per row. You can change this to 3 if you want.
const NUM_COLUMNS = 3;

// The gap between cards and between cards and the screen edge
const GAP = 8;
const PADDING = 8;

export default function SourceBrowseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { sourceId } = route.params;
  const source = sourceRegistry.getSource(sourceId);

  // useWindowDimensions is a hook — it must be called inside the component,
  // not at the top of the file. This is a React rule: hooks only go inside
  // components or other hooks, never outside them.
  const { width: rawWidth } = useWindowDimensions();
  // Cap at 768px so cards don't become huge on wide screens.
  // On a real phone this cap never triggers since phones are narrower than 768px.
  const screenWidth = Math.min(rawWidth, 768);
  
  // Calculate the card width here, inside the component, using the live
  // screen width. This is the correct approach vs. calculating it at
  // module level where it only runs once when the file first loads.
  //
  // Formula breakdown:
  //   screenWidth          → full width of the screen
  //   - PADDING * 2        → subtract left and right outer padding (8 + 8 = 16)
  //   - GAP * (cols - 1)   → subtract the gap(s) between cards (just 1 gap for 2 cols)
  //   / NUM_COLUMNS        → divide equally between cards
  const cardWidth = (screenWidth - PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const [mode, setMode] = useState<BrowseMode>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['browse', sourceId, mode, activeSearch],
    queryFn: async ({ pageParam }) => {
      if (!source) throw new Error('Source not found');
      const page = pageParam as number;
      if (mode === 'search' && activeSearch) {
        return source.search(activeSearch, page);
      } else if (mode === 'latest') {
        return source.getLatest(page);
      } else {
        return source.getPopular(page);
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length === 0) return undefined;
      return allPages.length + 1;
    },
  });

  // Flatten pages into one array of all manga
  const allManga: Manga[] = data?.pages.flatMap(page => page) ?? [];

  // ── Pair manga into rows ──
  // Instead of giving FlashList individual manga cards,
  // we group them into pairs: [[manga1, manga2], [manga3, manga4], ...]
  // Each pair becomes one row with two cards side by side.
  //
  // useMemo means this calculation only re-runs when allManga changes,
  // not on every render. Good for performance.
  const rows = useMemo(() => {
    const result: Manga[][] = [];

    // Loop through allManga two at a time
    for (let i = 0; i < allManga.length; i += NUM_COLUMNS) {
      // slice(i, i + NUM_COLUMNS) takes up to NUM_COLUMNS items starting at i.
      // If we're at the last item and there's no pair, it just takes one.
      result.push(allManga.slice(i, i + NUM_COLUMNS));
    }

    return result;
  }, [allManga]);

  const handleMangaPress = useCallback((manga: Manga) => {
    navigation.navigate('MangaDetail', {
      mangaId: manga.id,
      sourceId: manga.sourceId,
    });
  }, [navigation]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    setActiveSearch(searchQuery.trim());
    setMode('search');
  }, [searchQuery]);

  const handleModeChange = useCallback((newMode: BrowseMode) => {
    setMode(newMode);
    setActiveSearch('');
  }, []);

  if (!source) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Source not found.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b35" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load content.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tap to retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${source.name}...`}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Mode Tabs */}
      <View style={styles.modeContainer}>
        {(['popular', 'latest'] as BrowseMode[]).map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.modeButton, mode === m && styles.modeButtonActive]}
            onPress={() => handleModeChange(m)}
          >
            <Text style={[styles.modeButtonText, mode === m && styles.modeButtonTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Grid — now a list of ROWS, not individual cards */}
      <FlashList
        // data is now 'rows' (array of pairs) instead of allManga
        data={rows}
        // Each row's key is the ID of its first manga
        keyExtractor={row => row[0].id}
        renderItem={({ item: row }) => (
          // Each row is a horizontal View containing the cards
          <View style={styles.row}>
            {row.map(manga => (
              <MangaCard
                key={manga.id}
                manga={manga}
                onPress={handleMangaPress}
                // We pass the calculated cardWidth down to each card
                cardWidth={cardWidth}
              />
            ))}

            {/* If the last row only has 1 card, render an invisible
                placeholder to stop the single card from stretching
                to fill the whole row */}
            {row.length < NUM_COLUMNS && (
              <View style={{ width: cardWidth }} />
            )}
          </View>
        )}
        // estimatedItemSize is now the height of a ROW, not a card
        estimatedItemSize={cardWidth * 1.5 + GAP}
        contentContainerStyle={styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#ff6b35" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No results found.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#141414',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 15,
  },
  searchButton: {
    backgroundColor: '#ff6b35',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
  },
  modeButtonActive: {
    backgroundColor: '#ff6b35',
  },
  modeButtonText: {
    color: '#888888',
    fontWeight: '600',
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: PADDING,
  },
  // Each row is a horizontal flex container
  row: {
    flexDirection: 'row',   // Cards sit side by side
    gap: GAP,               // Gap between the two cards in a row
    marginBottom: GAP,      // Gap between rows
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 16,
    marginTop: 40,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});