// src/screens/SourceListScreen.tsx
import {
  View,
  Text,
  FlatList,        // An efficient scrollable list
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sourceRegistry } from '../services/sources';
import { MangaSource, SourceCategory } from '../types';
import { RootStackParamList } from '../navigation/types';

// This tells TypeScript what type our navigation object is.
// It links the navigation prop to our RootStackParamList so TypeScript
// knows which screens we can navigate to and what params they need.
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// The categories we want to display, in this order
const CATEGORIES: SourceCategory[] = ['manga', 'manhwa', 'manhua', 'comics'];

// A small component just for rendering one source row
function SourceRow({
  source,
  onPress,
}: {
  source: MangaSource;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.sourceRow} onPress={onPress} activeOpacity={0.7}>
      {/* Source icon */}
      <Image
        source={{ uri: source.iconUrl }}
        style={styles.sourceIcon}
        // defaultSource shows a fallback if the icon fails to load
        defaultSource={require('../../assets/icon.png')}
      />

      {/* Source name and language */}
      <View style={styles.sourceInfo}>
        <Text style={styles.sourceName}>{source.name}</Text>
        <Text style={styles.sourceLang}>{source.language.toUpperCase()}</Text>
      </View>

      {/* Arrow indicator */}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function SourceListScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Get all sources grouped by category.
  // We build an object like: { manga: [...], manhwa: [...], ... }
  const sourcesByCategory = CATEGORIES.reduce<Record<SourceCategory, MangaSource[]>>(
    (acc, category) => {
      // For each category, get the sources that belong to it
      acc[category] = sourceRegistry.getSourcesByCategory(category);
      return acc;
      // The second argument {} is the starting value of 'acc'
    },
    {} as Record<SourceCategory, MangaSource[]>
  );

  return (
    <FlatList
      style={styles.container}
      // We're using the CATEGORIES array as our list data.
      // Each item is a category string like 'manga' or 'manhwa'.
      data={CATEGORIES}
      keyExtractor={item => item}  // Each item's unique key is its category string
      renderItem={({ item: category }) => {
        const sources = sourcesByCategory[category];

        // If no sources exist for this category, don't render anything
        if (sources.length === 0) return null;

        return (
          <View>
            {/* Category header */}
            <Text style={styles.categoryHeader}>
              {/* Capitalise first letter: 'manga' → 'Manga' */}
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>

            {/* Render each source in this category */}
            {sources.map(source => (
              <SourceRow
                key={source.id}
                source={source}
                onPress={() =>
                  // Navigate to the source browse screen, passing the source ID
                  navigation.navigate('SourceBrowse', { sourceId: source.id })
                }
              />
            ))}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  categoryHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ff6b35',
    paddingHorizontal: 16,
    paddingVertical: 10,
    // Makes the header text all uppercase
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    backgroundColor: '#141414',
  },
  sourceRow: {
    flexDirection: 'row',   // Children sit side by side (horizontal)
    alignItems: 'center',   // Vertically center them
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    backgroundColor: '#0f0f0f',
  },
  sourceIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2a2a2a',
  },
  sourceInfo: {
    flex: 1,          // Takes up all remaining space between icon and arrow
    marginLeft: 12,
  },
  sourceName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sourceLang: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  arrow: {
    color: '#888888',
    fontSize: 24,
    marginLeft: 8,
  },
});