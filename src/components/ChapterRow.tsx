// src/components/ChapterRow.tsx
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Chapter } from '../types';

interface ChapterRowProps {
  chapter: Chapter;
  // isRead will come from the library system in Phase 7.
  // For now we just accept it as a prop so the interface is ready.
  isRead?: boolean;
  onPress: (chapter: Chapter) => void;
}

// Helper to format the upload date into something readable.
// '2024-01-15T00:00:00Z' → 'Jan 15, 2024'
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    // If the date string is malformed, just return it as-is
    return dateString;
  }
}

export default function ChapterRow({ chapter, isRead = false, onPress }: ChapterRowProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(chapter)}
      activeOpacity={0.7}
    >
      {/* Left side — chapter title and date */}
      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            // If the chapter has been read, dim the title.
            // The array syntax merges multiple styles together.
            // Styles later in the array override earlier ones.
            isRead && styles.titleRead,
          ]}
          numberOfLines={1}
        >
          {/* Show 'Chapter 12' if no title, or 'Chapter 12 - Title' if there is one */}
          {`Chapter ${chapter.chapterNumber}`}
          {chapter.title && chapter.title !== `Chapter ${chapter.chapterNumber}`
            ? ` — ${chapter.title}`
            : ''}
        </Text>
        <Text style={styles.date}>{formatDate(chapter.uploadDate)}</Text>
      </View>

      {/* Right side — read indicator */}
      {isRead && (
        <View style={styles.readBadge}>
          <Text style={styles.readText}>Read</Text>
        </View>
      )}

      {/* Arrow */}
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
    backgroundColor: '#0f0f0f',
  },
  info: {
    // flex: 1 makes the info section take up all space
    // between the left edge and the right-side badges/arrow
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  titleRead: {
    // Dimmed colour for read chapters
    color: '#555555',
  },
  date: {
    color: '#666666',
    fontSize: 12,
    marginTop: 3,
  },
  readBadge: {
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  readText: {
    color: '#555555',
    fontSize: 11,
    fontWeight: '600',
  },
  arrow: {
    color: '#444444',
    fontSize: 22,
  },
});