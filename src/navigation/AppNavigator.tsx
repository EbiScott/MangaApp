// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import SourceListScreen from '../screens/SourceListScreen';
import SourceBrowseScreen from '../screens/SourceBrowseScreen';

// Import all our screens
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import LibraryScreen from '../screens/LibraryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MangaDetailScreen from '../screens/MangaDetailScreen';
import ReaderScreen from '../screens/ReaderScreen';

// Import our navigation types
import { RootStackParamList, TabParamList } from '../types/types';

// Create the navigators using our types
// This is what gives us type-safe navigation later
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();


// This is the stack for the Home tab
// It starts at HomeScreen but can navigate deeper
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="MangaDetail"
        component={MangaDetailScreen}
        options={{
          // Hide the navigation header — our hero image IS the header
          headerShown: false,
        }}
      />      
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

// The stack for the Browse tab
function BrowseStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      {/* SourceListScreen is the new entry point for Browse */}
      <Stack.Screen
        name="Browse"
        component={SourceListScreen}
        options={{ title: 'Sources' }}
      />

      {/* Tapping a source goes here */}
      <Stack.Screen
        name="SourceBrowse"
        component={SourceBrowseScreen}
        // The title is set dynamically from params
        options={({ route }) => ({
          title: (route.params as { sourceId: string }).sourceId,
        })}
      />

    <Stack.Screen
      name="MangaDetail"
      component={MangaDetailScreen}
      options={{
        // Hide the navigation header — our hero image IS the header
        headerShown: false,
      }}
    />      
    <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

// The stack for the Library tab
function LibraryStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0f0f0f' },
        headerTintColor: '#ffffff',
        contentStyle: { backgroundColor: '#0f0f0f' },
      }}
    >
      <Stack.Screen name="Library" component={LibraryScreen} />
      <Stack.Screen
        name="MangaDetail"
        component={MangaDetailScreen}
        options={{
          // Hide the navigation header — our hero image IS the header
          headerShown: false,
        }}
      />
      <Stack.Screen name="Reader" component={ReaderScreen} />
    </Stack.Navigator>
  );
}

// The root of the entire app's navigation
export default function AppNavigator() {
  return (
    // NavigationContainer is the outermost wrapper — always required
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // This function runs for every tab to determine its icon
          tabBarIcon: ({ focused, color, size }) => {
            // 'focused' = is this the currently active tab?
            // We pick a filled icon when active, outline when not
            let iconName: keyof typeof Ionicons.glyphMap;

            if (route.name === 'HomeTab') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'BrowseTab') {
              iconName = focused ? 'compass' : 'compass-outline';
            } else if (route.name === 'LibraryTab') {
              iconName = focused ? 'library' : 'library-outline';
            } else {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          // Color of the active tab icon and label
          tabBarActiveTintColor: '#ff6b35',
          // Color of inactive tab icons and labels
          tabBarInactiveTintColor: '#888888',
          // Style the tab bar itself
          tabBarStyle: {
            backgroundColor: '#1a1a1a',
            borderTopColor: '#2a2a2a',
            borderTopWidth: 1,
          },
          // Hide the header on tab screens (each stack manages its own header)
          headerShown: false,
        })}
      >
        {/* Each Tab.Screen renders a full stack, not just one screen */}
        <Tab.Screen
          name="HomeTab"
          component={HomeStack}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="BrowseTab"
          component={BrowseStack}
          options={{ tabBarLabel: 'Browse' }}
        />
        <Tab.Screen
          name="LibraryTab"
          component={LibraryStack}
          options={{ tabBarLabel: 'Library' }}
        />
        <Tab.Screen
          name="SettingsTab"
          component={SettingsScreen}
          options={{ tabBarLabel: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}