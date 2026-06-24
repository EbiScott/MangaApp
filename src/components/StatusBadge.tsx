// src/components/StatusBadge.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Manga } from '../types';

// We only need the 'status' field from Manga, not the whole object.
// This is TypeScript's 'Pick' utility — it creates a new type containing
// only the fields you specify from an existing type.
// Pick<Manga, 'status'> gives us: { status: 'ongoing' | 'completed' | ... }
interface StatusBadgeProps {
  status: Manga['status'];
}

// Map each status to a colour
const STATUS_COLORS: Record<Manga['status'], string> = {
  ongoing: '#2ecc71',    // Green — it's active
  completed: '#3498db',  // Blue — it's done
  hiatus: '#f39c12',     // Orange — it's paused
  unknown: '#888888',    // Grey — we don't know
};

// Map each status to a display label
const STATUS_LABELS: Record<Manga['status'], string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
  unknown: 'Unknown',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  return (
    <View style={[styles.badge, { backgroundColor: color + '33' }]}>
      {/* The '33' appended to the hex colour makes it 20% opacity.
          Hex colours can have an alpha (transparency) value as the last
          two digits. '33' in hex = 20 in decimal = 20% opacity.
          This gives us a subtle tinted background. */}
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    // alignSelf prevents the badge from stretching to full width.
    // By default a View in a column flex container stretches horizontally.
    // 'flex-start' makes it only as wide as its content.
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,  // Half of width/height = perfect circle
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});