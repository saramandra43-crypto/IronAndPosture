import { useEffect, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { cancelRestFinishedNotification, scheduleRestFinishedNotification } from '@/src/notifications/restNotifications';
import { useIronStore } from '@/src/store/useIronStore';

export function RestTimer() {
  const time = useIronStore((s) => s.restTimeLeft);
  const running = useIronStore((s) => s.restTimerRunning);
  const endsAt = useIronStore((s) => s.restEndsAt);
  const tick = useIronStore((s) => s.tickRestTimer);
  const start = useIronStore((s) => s.startRestTimer);
  const stop = useIronStore((s) => s.stopRestTimer);
  const lastScheduledEndsAt = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [running, tick]);

  useEffect(() => {
    if (!endsAt || endsAt === lastScheduledEndsAt.current) return;
    lastScheduledEndsAt.current = endsAt;
    const seconds = Math.max(1, Math.ceil((endsAt - Date.now()) / 1000));
    scheduleRestFinishedNotification(seconds).catch(() => undefined);
  }, [endsAt]);

  const min = Math.floor(time / 60).toString().padStart(2, '0');
  const sec = (time % 60).toString().padStart(2, '0');

  function stopManually() {
    cancelRestFinishedNotification().catch(() => undefined);
    lastScheduledEndsAt.current = null;
    stop();
  }

  return (
    <View className="rounded-[28px] border border-iron-line bg-iron-card p-5">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-black tracking-[3px] text-zinc-500">REST TIMER</Text>
        <View className={`rounded-full px-3 py-1 ${running ? 'bg-[#26150f]' : 'bg-zinc-800'}`}>
          <Text className={`text-[10px] font-black ${running ? 'text-iron-orange' : 'text-zinc-500'}`}>{running ? 'RUNNING' : 'READY'}</Text>
        </View>
      </View>
      <Text className="mt-2 text-5xl font-black text-white">{min}:{sec}</Text>
      <Text className="mt-2 text-xs text-zinc-500">앱을 벗어나도 휴식 종료 로컬 알림이 예약돼.</Text>
      <View className="mt-5 flex-row gap-3">
        <Pressable onPress={() => start(Math.max(15, time - 15 || 75))} className="flex-1 rounded-2xl bg-zinc-800 py-3">
          <Text className="text-center font-bold text-zinc-200">-15</Text>
        </Pressable>
        <Pressable onPress={() => running ? stopManually() : start(time || 90)} className="flex-[1.3] rounded-2xl bg-iron-orange py-3">
          <Text className="text-center font-black text-white">{running ? 'STOP' : 'START'}</Text>
        </Pressable>
        <Pressable onPress={() => start((time || 90) + 15)} className="flex-1 rounded-2xl bg-zinc-800 py-3">
          <Text className="text-center font-bold text-zinc-200">+15</Text>
        </Pressable>
      </View>
    </View>
  );
}
