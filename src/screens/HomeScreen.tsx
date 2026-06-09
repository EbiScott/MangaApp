// src/screens/HomeScreen.tsx
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { sourceRegistry } from '../services/sources';
import { Manga } from '../types';

export default function HomeScreen() {
  // useState stores data that can change over time.
  // When it changes, React re-renders the component automatically.
  const [manga, setManga] = useState<Manga[]>([]);   // List of manga
  const [loading, setLoading] = useState(true);       // Are we fetching?
  const [error, setError] = useState<string | null>(null); // Any errors?

  // useEffect runs code AFTER the component renders.
  // The empty [] at the end means "only run this once, on first load".
  useEffect(() => {
    async function loadManga() {
      try {
        const source = sourceRegistry.getSource('mangadex');
        if (!source) throw new Error('MangaDex source not found');

        const results = await source.getPopular(1);
        setManga(results);
      } catch (err) {
        setError('Failed to load manga. Check your internet connection.');
        console.error(err);
      } finally {
        // 'finally' runs whether the try succeeded or the catch ran
        setLoading(false);
      }
    }

    loadManga();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ff6b35" />
        <Text style={styles.loadingText}>Loading manga...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Popular on MangaDex</Text>
      {manga.map(item => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.genres}>{item.genres.join(', ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { padding: 16 },
  heading: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  item: { backgroundColor: '#1a1a1a', padding: 12, borderRadius: 8, marginBottom: 8 },
  title: { color: '#fff', fontWeight: '600', fontSize: 15 },
  genres: { color: '#888', fontSize: 12, marginTop: 4 },
  loadingText: { color: '#888', marginTop: 12 },
  errorText: { color: '#ff4444', textAlign: 'center', padding: 20 },
});