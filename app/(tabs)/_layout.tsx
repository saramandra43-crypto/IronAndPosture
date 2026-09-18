import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#111214', borderTopColor: '#25272B', height: 78, paddingTop: 8, paddingBottom: 12 },
        tabBarActiveTintColor: '#F15A24',
        tabBarInactiveTintColor: '#666A70',
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
      }}
    >
      <Tabs.Screen name="correction" options={{ title: '교정', tabBarIcon: ({ color, size }) => <Ionicons name="body-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="workout" options={{ title: '운동', tabBarIcon: ({ color, size }) => <Ionicons name="barbell-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: '성장', tabBarIcon: ({ color, size }) => <Ionicons name="analytics-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}
