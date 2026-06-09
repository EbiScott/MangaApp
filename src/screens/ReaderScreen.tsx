import { View, Text, StyleSheet } from 'react-native';

export default function ReaderScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>📄 Reader</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});