// src/components/MangaCard.tsx
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  useWindowDimensions,  // A hook that returns the current window size.
                         // Unlike Dimensions.get(), this automatically
                         // updates if the screen is rotated or resized.
} from 'react-native';
import { Image } from 'expo-image';
import { Manga } from '../types';

interface MangaCardProps {
  manga: Manga;
  onPress: (manga: Manga) => void;
  // We now accept cardWidth as a prop so the parent can tell us
  // exactly how wide to be. This removes all guesswork from the card.
  cardWidth: number;
}

export default function MangaCard({ manga, onPress, cardWidth }: MangaCardProps) {
  // Card height is always 1.5x the width — standard manga cover ratio
  const cardHeight = cardWidth * 1.5;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        // We apply width and height dynamically using the prop,
        // not hardcoded constants calculated at the top of the file.
        { width: cardWidth, height: cardHeight },
      ]}
      onPress={() => onPress(manga)}
      activeOpacity={0.7}
    >
      <Image
        source={{ uri: manga.coverUrl }}
        style={styles.cover}
        contentFit="cover"
        placeholder={{ color: '#2a2a2a' }}
        transition={300}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {manga.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    marginBottom: 4,   // ← add this line only
  },
  cover: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});