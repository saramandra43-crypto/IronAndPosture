import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { loadBootstrapSettings } from '@/src/db/database';
import { useIronStore } from '@/src/store/useIronStore';

export default function Index() {
  const db = useSQLiteContext();
  const hydrated = useIronStore((s) => s.hydrated);
  const onboarded = useIronStore((s) => s.onboarded);
  const hydrate = useIronStore((s) => s.hydrate);

  useEffect(() => {
    if (hydrated) return;
    loadBootstrapSettings(db)
      .then(hydrate)
      .catch(() => hydrate({ onboarded: false, pelvicTilt: null, interlockMode: 'soft' }));
  }, [db, hydrate, hydrated]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-iron-bg">
        <ActivityIndicator size="large" color="#F15A24" />
      </View>
    );
  }

  return <Redirect href={onboarded ? '/(tabs)/correction' : '/onboarding'} />;
}
