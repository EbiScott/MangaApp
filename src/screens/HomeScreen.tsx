// src/screens/HomeScreen.tsx
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { FlashList } from '@shopify/flash-list';
import { sourceRegistry } from '../services/sources';
import { Manga } from '../types';
import MangaCard from '../components/MangaCard';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Each card takes 38% of screen width, but we add a small
// right margin so there's breathing room between cards.
const HORIZONTAL_CARD_RATIO = 0.38;
const CARD_HORIZONTAL_GAP = 8;

function MangaRow({ title, sourceId, type }: {
  title: string;
  sourceId: string;
  type: 'popular' | 'latest';
}) {
  const navigation = useNavigation<NavigationProp>();
  const source = sourceRegistry.getSource(sourceId);

  // Get live screen width and cap it for web
  const { width: rawWidth } = useWindowDimensions();
  const screenWidth = Math.min(rawWidth, 768);

  // Each card in the horizontal row takes up 38% of the screen width.
  // This means you can see about 2.5 cards at a time, which hints
  // that the row is scrollable without cutting off cards awkwardly.
  const cardWidth = screenWidth * HORIZONTAL_CARD_RATIO;

  const { data, isLoading, error } = useQuery({
    queryKey: ['home', sourceId, type],
    queryFn: () => {
      if (!source) throw new Error('Source not found');
      return type === 'popular' ? source.getPopular(1) : source.getLatest(1);
    },
    enabled: !!source,
  });

  return (
    <View style={rowStyles.section}>
      <Text style={rowStyles.sectionTitle}>{title}</Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#ff6b35" style={rowStyles.loader} />
      ) : error ? (
        // Show a subtle error state instead of crashing the whole screen
        <Text style={rowStyles.errorText}>Failed to load</Text>
      ) : (
        <FlashList
          data={data ?? []}
          horizontal
          keyExtractor={item => item.id}
          renderItem={({ item }: { item: Manga }) => (
          // This wrapper View adds the gap to the right of every card
          <View style={{ marginRight: CARD_HORIZONTAL_GAP }}>
            <MangaCard
              manga={item}
              cardWidth={cardWidth}
              onPress={() =>
                navigation.navigate('MangaDetail', {
                  mangaId: item.id,
                  sourceId: item.sourceId,
                })
              }
            />
          </View>
        )}
          estimatedItemSize={cardWidth}
          contentContainerStyle={rowStyles.listContent}
          showsHorizontalScrollIndicator={false}
        />
      )}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.header}>MangaApp</Text>
      <MangaRow title="🔥 Popular" sourceId="mangadex" type="popular" />
      <MangaRow title="🕐 Latest Updates" sourceId="mangadex" type="latest" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    padding: 16,
    paddingTop: 20,
  },
});

const rowStyles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 8,
  },
  errorText: {
    color: '#888',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});