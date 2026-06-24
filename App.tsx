// App.tsx
import { StatusBar } from 'expo-status-bar';

// QueryClient is the cache manager — it stores all fetched data
// QueryClientProvider makes that cache available to the whole app
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './src/services/sources';
import AppNavigator from './src/navigation/AppNavigator';

// Create one QueryClient instance for the entire app.
// We define it OUTSIDE the component so it's only created once —
// if it were inside the component, it would be recreated on every render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long data stays "fresh" before TanStack Query refetches it.
      // 5 minutes in milliseconds. During this time, if you ask for
      // the same data again, it returns the cached version instantly.
      staleTime: 1000 * 60 * 5,

      // How long unused data stays in cache before being garbage collected.
      // 10 minutes. Even if data is "stale", it stays in memory for this long.
      gcTime: 1000 * 60 * 10,

      // If a fetch fails, how many times should it retry before giving up?
      retry: 2,
    },
  },
});

export default function App() {
  return (
    // QueryClientProvider must wrap everything that uses TanStack Query.
    // We pass it the queryClient instance we created above.
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AppNavigator />
    </QueryClientProvider>
  );
}