// App.tsx
import { StatusBar } from 'expo-status-bar';
import './src/services/sources'; // This runs the registration code
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}