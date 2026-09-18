import { useCallback, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { getAnalyticsSnapshot, setSetting, type AnalyticsSnapshot } from '@/src/db/database';
import { calculateOneRM } from '@/src/logic/oneRM';
import { useIronStore } from '@/src/store/useIronStore';
import type { PelvicTilt } from '@/src/types';

const tiltOptions: { id: PelvicTilt; label: string }[] = [
  { id: 'anterior', label: '전방경사' },
  { id: 'posterior', label: '후방경사' },
  { id: 'neutral', label: '중립/모름' },
];

export default function AnalyticsScreen() {
  const db = useSQLiteContext();
  const settings = useIronStore((s) => s.settings);
  const setPelvicTilt = useIronStore((s) => s.setPelvicTilt);
  const setInterlockMode = useIronStore((s) => s.setInterlockMode);
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);

  const refresh = useCallback(() => {
    const since = startOfDay(Date.now() - 6 * 24 * 60 * 60 * 1000);
    getAnalyticsSnapshot(db, since).then(setSnapshot).catch(() => setSnapshot(null));
  }, [db]);

  useFocusEffect(useCallback(() => {
    refresh();
  }, [refresh]));

  const data = useMemo(() => buildAnalytics(snapshot), [snapshot]);

  async function changeTilt(tilt: PelvicTilt) {
    setPelvicTilt(tilt);
    await setSetting(db, 'pelvicTilt', tilt);
  }

  async function changeInterlock(mode: 'soft' | 'hard') {
    setInterlockMode(mode);
    await setSetting(db, 'interlockMode', mode);
  }

  return (
    <SafeAreaView className="flex-1 bg-iron-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 34, paddingBottom: 120 }}>
        <Text className="text-xs font-black tracking-[3px] text-zinc-500">PROGRESS</Text>
        <Text className="mt-2 text-3xl font-black text-white">종합 데이터</Text>
        <Text className="mt-2 text-zinc-500">최근 7일의 볼륨·1RM·교정 실행 데이터를 한 번에 본다.</Text>

        <View className="mt-6 flex-row gap-3">
          <MetricCard label="7D VOLUME" value={`${Math.round(data.totalVolume).toLocaleString()} kg`} />
          <MetricCard label="WORKOUTS" value={`${data.workoutDays}일`} />
        </View>
        <View className="mt-3 flex-row gap-3">
          <MetricCard label="CORRECTION" value={`${data.correctionRate}%`} />
          <MetricCard label="TOP 1RM" value={data.topOneRM ? `${data.topOneRM.value} kg` : '—'} />
        </View>

        <View className="mt-5 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-xs font-black tracking-[2px] text-zinc-500">WEEKLY VOLUME</Text>
              <Text className="mt-2 text-2xl font-black text-white">{Math.round(data.totalVolume).toLocaleString()} kg</Text>
            </View>
            <Text className="text-xs font-bold text-zinc-600">최근 7일</Text>
          </View>
          <View className="mt-7 h-36 flex-row items-end justify-between gap-2">
            {data.days.map((day) => {
              const height = data.maxDayVolume ? Math.max(6, (day.volume / data.maxDayVolume) * 118) : 6;
              return (
                <View key={day.key} className="flex-1 items-center justify-end">
                  <Text className="mb-2 text-[9px] font-bold text-zinc-600">{day.volume > 0 ? Math.round(day.volume / 1000) + 'k' : ''}</Text>
                  <View className={`w-full max-w-8 rounded-t-lg ${day.volume > 0 ? 'bg-iron-orange' : 'bg-zinc-800'}`} style={{ height }} />
                  <Text className="mt-2 text-[10px] font-black text-zinc-500">{day.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="mt-5 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <Text className="text-xs font-black tracking-[2px] text-zinc-500">ESTIMATED 1RM</Text>
          {data.oneRMs.length === 0 ? (
            <Text className="mt-4 leading-6 text-zinc-500">웨이트 세트를 저장하면 종목별 예상 1RM이 여기에 쌓여.</Text>
          ) : (
            <View className="mt-2">
              {data.oneRMs.slice(0, 6).map((item, index) => (
                <View key={item.exerciseId} className={`flex-row items-center justify-between py-4 ${index > 0 ? 'border-t border-zinc-800' : ''}`}>
                  <View className="flex-1 pr-4">
                    <Text className="font-black text-white">{item.exerciseName}</Text>
                    <Text className="mt-1 text-xs text-zinc-600">최고 추정치</Text>
                  </View>
                  <Text className="text-xl font-black text-iron-orange">{item.value} kg</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="mt-5 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <Text className="text-xs font-black tracking-[2px] text-zinc-500">POSTURE SETTINGS</Text>
          <Text className="mt-2 text-lg font-black text-white">골반 타입</Text>
          <View className="mt-4 flex-row gap-2">
            {tiltOptions.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => changeTilt(option.id)}
                className={`flex-1 rounded-xl py-3 ${settings.pelvicTilt === option.id ? 'bg-[#26150f]' : 'bg-zinc-900'}`}
              >
                <Text className={`text-center text-[10px] font-black ${settings.pelvicTilt === option.id ? 'text-iron-orange' : 'text-zinc-600'}`}>{option.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text className="mt-6 text-lg font-black text-white">Interlock 강도</Text>
          <Text className="mt-2 text-xs leading-5 text-zinc-500">Soft는 경고만, Hard는 PREP 완료 전 메인 리프트 기록 버튼을 잠가.</Text>
          <View className="mt-4 flex-row gap-2">
            {(['soft', 'hard'] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => changeInterlock(mode)}
                className={`flex-1 rounded-xl py-3 ${settings.interlockMode === mode ? 'bg-iron-orange' : 'bg-zinc-900'}`}
              >
                <Text className={`text-center text-xs font-black ${settings.interlockMode === mode ? 'text-white' : 'text-zinc-600'}`}>{mode.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable onPress={refresh} className="mt-5 rounded-2xl bg-zinc-900 py-4">
          <Text className="text-center font-black text-zinc-400">데이터 새로고침</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-2xl border border-iron-line bg-iron-card p-4">
      <Text className="text-[10px] font-black tracking-[1px] text-zinc-600">{label}</Text>
      <Text className="mt-2 text-xl font-black text-white">{value}</Text>
    </View>
  );
}

function buildAnalytics(snapshot: AnalyticsSnapshot | null) {
  const today = startOfDay(Date.now());
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = today - (6 - index) * 24 * 60 * 60 * 1000;
    return {
      key: new Date(date).toISOString().slice(0, 10),
      label: ['일', '월', '화', '수', '목', '금', '토'][new Date(date).getDay()],
      start: date,
      end: date + 24 * 60 * 60 * 1000,
      volume: 0,
    };
  });

  const oneRMMap = new Map<string, { exerciseId: string; exerciseName: string; value: number }>();
  const workoutDayKeys = new Set<string>();

  for (const set of snapshot?.workoutSets ?? []) {
    const volume = set.weight * set.reps;
    const day = days.find((candidate) => set.completedAt >= candidate.start && set.completedAt < candidate.end);
    if (day) {
      day.volume += volume;
      workoutDayKeys.add(day.key);
    }
    const oneRM = calculateOneRM(set.weight, set.reps);
    const current = oneRMMap.get(set.exerciseId);
    if (!current || oneRM > current.value) {
      oneRMMap.set(set.exerciseId, { exerciseId: set.exerciseId, exerciseName: set.exerciseName, value: oneRM });
    }
  }

  const correctionDays = new Set(
    (snapshot?.correctionLogs ?? []).map((log) => new Date(startOfDay(log.completedAt)).toISOString().slice(0, 10)),
  );
  const oneRMs = Array.from(oneRMMap.values()).sort((a, b) => b.value - a.value);
  const totalVolume = days.reduce((sum, day) => sum + day.volume, 0);

  return {
    days,
    maxDayVolume: Math.max(0, ...days.map((day) => day.volume)),
    totalVolume,
    workoutDays: workoutDayKeys.size,
    correctionRate: Math.round((correctionDays.size / 7) * 100),
    oneRMs,
    topOneRM: oneRMs[0] ?? null,
  };
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}
