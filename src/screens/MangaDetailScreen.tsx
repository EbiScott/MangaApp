// src/screens/MangaDetailScreen.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useMangaDetail } from '../hooks/useMangaDetail';
import { Chapter } from '../types';
import StatusBadge from '../components/StatusBadge';
import ChapterRow from '../components/ChapterRow';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RoutePropType = RouteProp<RootStackParamList, 'MangaDetail'>;

// How many lines of description to show when collapsed
const DESCRIPTION_COLLAPSED_LINES = 3;

export default function MangaDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();

  // Pull the params out of the route
  const { mangaId, sourceId } = route.params;

  // Get screen dimensions for responsive layout
  const { width: screenWidth } = useWindowDimensions();

  // Local UI state — is the description expanded or collapsed?
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  // Use our custom hook to get all the data we need
  const { manga, isMangaLoading, mangaError, chapters, isChaptersLoading } =
    useMangaDetail(mangaId, sourceId);

  // ── Loading State ──
  if (isMangaLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading manga details...</Text>
      </View>
    );
  }

  // ── Error State ──
  if (mangaError || !manga) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load manga details.</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Chapter Press Handler ──
  const handleChapterPress = (chapter: Chapter) => {
    navigation.navigate('Reader', {
      mangaId: manga.id,
      chapterId: chapter.id,
      chapterNumber: chapter.chapterNumber,
    });
  };

  // ── Cover dimensions ──
  // The cover thumbnail is always a fixed ratio.
  // We size it relative to screen width so it looks good on all devices.
  const coverWidth = screenWidth * 0.32;
  const coverHeight = coverWidth * 1.5;

  // ── Header Height ──
  // The blurred background header area
  const headerHeight = coverHeight + 80;

  return (
    // We use FlatList here instead of ScrollView because the chapter list
    // can be hundreds of items long. FlatList virtualizes the list —
    // it only renders chapters that are currently visible on screen,
    // keeping memory usage low even for manga with 500+ chapters.
    // ScrollView would render ALL chapters at once, which would be slow.
    <FlatList
      style={styles.container}
      // The ListHeaderComponent renders above the scrollable list.
      // Everything except the chapter rows goes here.
      ListHeaderComponent={
        <View>
          {/* ── Hero Header ── */}
          {/* This section has the blurred background + cover thumbnail */}
          <View style={[styles.header, { height: headerHeight }]}>

            {/* Blurred background — the cover image fills the header
                and is blurred to create a cinematic backdrop */}
            <Image
              source={{ uri: manga.coverUrl }}
              style={StyleSheet.absoluteFill}  // Fills parent completely
              contentFit="cover"
            />

            {/* BlurView sits on top of the image and blurs everything behind it.
                intensity controls how strong the blur is (0-100).
                tint controls the colour overlay: 'dark' adds a dark tint. */}
            <BlurView
              style={StyleSheet.absoluteFill}
              intensity={60}
              tint="dark"
            />

            {/* Dark overlay for extra contrast so text is readable */}
            <View style={[StyleSheet.absoluteFill, styles.headerOverlay]} />

            {/* Content row: cover thumbnail on left, info on right */}
            <View style={styles.headerContent}>

              {/* Cover thumbnail */}
              <Image
                source={{ uri: manga.coverUrl }}
                style={[
                  styles.coverThumbnail,
                  { width: coverWidth, height: coverHeight },
                ]}
                contentFit="cover"
              />

              {/* Info section to the right of the cover */}
              <View style={styles.mangaInfo}>
                <Text style={styles.title} numberOfLines={3}>
                  {manga.title}
                </Text>

                <StatusBadge status={manga.status} />

                {/* Genres — show up to 3 to avoid overflow */}
                {manga.genres.length > 0 && (
                  <View style={styles.genresContainer}>
                    {manga.genres.slice(0, 3).map(genre => (
                      <View key={genre} style={styles.genreBadge}>
                        <Text style={styles.genreText}>{genre}</Text>
                      </View>
                    ))}
                    {/* Show '+N more' if there are more than 3 genres */}
                    {manga.genres.length > 3 && (
                      <View style={styles.genreBadge}>
                        <Text style={styles.genreText}>
                          +{manga.genres.length - 3}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Action Buttons ── */}
          <View style={styles.actionsContainer}>
            {/* Add to Library button — wired up fully in Phase 7 */}
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>+ Add to Library</Text>
            </TouchableOpacity>
          </View>

          {/* ── Synopsis ── */}
          {manga.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Synopsis</Text>
              <Text
                style={styles.description}
                // When collapsed, limit to 3 lines.
                // When expanded, numberOfLines={0} means no limit.
                numberOfLines={
                  isDescriptionExpanded ? 0 : DESCRIPTION_COLLAPSED_LINES
                }
              >
                {manga.description}
              </Text>
              {/* Toggle button to expand/collapse */}
              <TouchableOpacity
                onPress={() => setIsDescriptionExpanded(prev => !prev)}
                style={styles.expandButton}
              >
                {/* 'prev => !prev' is a functional state update.
                    It takes the current value and returns the opposite.
                    This is safer than 'setIsDescriptionExpanded(!isDescriptionExpanded)'
                    because it always uses the latest value. */}
                <Text style={styles.expandButtonText}>
                  {isDescriptionExpanded ? 'Show less ▲' : 'Show more ▼'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ── Chapters Header ── */}
          <View style={styles.chaptersHeader}>
            <Text style={styles.sectionTitle}>
              Chapters
              {/* Show chapter count once loaded */}
              {!isChaptersLoading && (
                <Text style={styles.chapterCount}> ({chapters.length})</Text>
              )}
            </Text>
            {isChaptersLoading && (
              <ActivityIndicator size="small" color="#ff6b35" />
            )}
          </View>
        </View>
      }

      // ── Chapter List ──
      // The actual scrollable data — each item is one chapter
      data={chapters}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ChapterRow
          chapter={item}
          isRead={false}  // Phase 7 will pass real read status
          onPress={handleChapterPress}
        />
      )}

      // Show a message if there are no chapters yet
      ListEmptyComponent={
        !isChaptersLoading ? (
          <View style={styles.emptyChapters}>
            <Text style={styles.emptyText}>No chapters available.</Text>
          </View>
        ) : null
      }
    />
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
    padding: 20,
  },
  loadingText: {
    color: '#888',
    marginTop: 12,
    fontSize: 14,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#ff6b35',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // ── Header ──
  header: {
    justifyContent: 'flex-end',  // Push content to the bottom of the header
    padding: 16,
  },
  headerOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',  // Align cover and info to the bottom
    gap: 14,
  },
  coverThumbnail: {
    borderRadius: 8,
    // Shadow on iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    // Shadow on Android
    elevation: 8,
  },
  mangaInfo: {
    flex: 1,
    gap: 8,
    paddingBottom: 4,
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',  // Wrap to next line if genres overflow
    gap: 6,
  },
  genreBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  genreText: {
    color: '#cccccc',
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Actions ──
  actionsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  primaryButton: {
    backgroundColor: '#ff6b35',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },

  // ── Synopsis ──
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  description: {
    color: '#aaaaaa',
    fontSize: 14,
    lineHeight: 22,
  },
  expandButton: {
    marginTop: 8,
  },
  expandButtonText: {
    color: '#ff6b35',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Chapters ──
  chaptersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  chapterCount: {
    color: '#888888',
    fontWeight: '400',
    fontSize: 15,
  },
  emptyChapters: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888888',
    fontSize: 15,
  },
});