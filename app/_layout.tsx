import '../global.css';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { migrateDbIfNeeded } from '@/src/db/database';
import { prepareRestNotifications } from '@/src/notifications/restNotifications';

export default function RootLayout() {
  useEffect(() => {
    prepareRestNotifications().catch(() => undefined);
  }, []);

  return (
    <SQLiteProvider databaseName="iron-posture.db" onInit={migrateDbIfNeeded}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0B0C0E' } }} />
    </SQLiteProvider>
  );
}
