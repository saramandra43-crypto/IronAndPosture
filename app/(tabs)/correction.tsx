import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { getCorrectionPreset } from '@/src/data/correctionPresets';
import { logCorrectionExercise } from '@/src/db/database';
import { useIronStore } from '@/src/store/useIronStore';
import type { CorrectionExercise } from '@/src/types';

export default function CorrectionScreen() {
  const db = useSQLiteContext();
  const tilt = useIronStore((s) => s.settings.pelvicTilt);
  const progress = useIronStore((s) => s.correctionProgress);
  const completeSet = useIronStore((s) => s.completeCorrectionSet);
  const reset = useIronStore((s) => s.resetCorrection);
  const [phase, setPhase] = useState<'pre' | 'post'>('pre');
  const [active, setActive] = useState<CorrectionExercise | null>(null);

  const allExercises = getCorrectionPreset(tilt);
  const exercises = useMemo(
    () => allExercises.filter((exercise) => exercise.phase === phase || exercise.phase === 'both'),
    [allExercises, phase],
  );
  const completed = exercises.filter((ex) => progress.some((p) => p.exerciseId === ex.id && p.completed)).length;
  const percent = exercises.length ? Math.round((completed / exercises.length) * 100) : 0;
  const title = tilt === 'posterior' ? '후방경사' : tilt === 'anterior' ? '전방경사' : '중립';

  async function handleComplete(exercise: CorrectionExercise) {
    if (!tilt) return;
    const current = progress.find((item) => item.exerciseId === exercise.id)?.completedSets ?? 0;
    if (current >= exercise.sets) return;
    const next = current + 1;
    completeSet(exercise.id, exercise.sets);
    if (next >= exercise.sets) {
      await logCorrectionExercise(db, exercise.id, tilt, exercise.sets);
    }
  }

  if (active) {
    const currentSets = progress.find((item) => item.exerciseId === active.id)?.completedSets ?? 0;
    return (
      <CorrectionRunner
        exercise={active}
        completedSets={currentSets}
        onBack={() => setActive(null)}
        onComplete={() => handleComplete(active)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-iron-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 34, paddingBottom: 120 }}>
        <Text className="text-xs font-black tracking-[3px] text-zinc-500">TODAY'S POSTURE</Text>
        <Text className="mt-2 text-3xl font-black text-white">{title} 교정 루틴</Text>
        <Text className="mt-2 leading-5 text-zinc-500">교정은 통증을 참고 버티는 운동이 아니야. 날카로운 통증이나 저림이 생기면 즉시 중단해.</Text>

        <View className="mt-6 flex-row rounded-2xl bg-zinc-900 p-1">
          <PhaseButton active={phase === 'pre'} label="운동 전 · PREP" onPress={() => setPhase('pre')} />
          <PhaseButton active={phase === 'post'} label="운동 후 · RECOVER" onPress={() => setPhase('post')} />
        </View>

        <View className="mt-5 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-zinc-400">{phase === 'pre' ? '운동 전 준비도' : '운동 후 회복도'}</Text>
              <Text className="mt-1 text-4xl font-black text-white">{percent}<Text className="text-xl text-zinc-500">%</Text></Text>
            </View>
            <Text className="font-bold text-zinc-500">{completed}/{exercises.length}</Text>
          </View>
          <View className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-800">
            <View className="h-full rounded-full bg-iron-orange" style={{ width: `${percent}%` }} />
          </View>
          {progress.length > 0 && (
            <Pressable
              onPress={() => Alert.alert('오늘 교정 기록 초기화', '화면의 오늘 진행률만 초기화할까?', [
                { text: '취소', style: 'cancel' },
                { text: '초기화', style: 'destructive', onPress: reset },
              ])}
              className="mt-4 self-start"
            >
              <Text className="font-bold text-zinc-500">오늘 진행률 초기화</Text>
            </Pressable>
          )}
        </View>

        <View className="mt-7 gap-4">
          {exercises.map((exercise) => {
            const p = progress.find((item) => item.exerciseId === exercise.id);
            const doneSets = p?.completedSets ?? 0;
            return (
              <Pressable key={exercise.id} onPress={() => setActive(exercise)} className="rounded-[26px] border border-iron-line bg-iron-card p-5">
                <View className="flex-row items-start justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-xs font-black tracking-[2px] text-iron-orange">{exercise.type.toUpperCase()} · {exercise.targetMuscle}</Text>
                    <Text className="mt-1 text-xl font-black text-white">{exercise.name}</Text>
                  </View>
                  {p?.completed ? <Ionicons name="checkmark-circle" size={28} color="#F15A24" /> : <Ionicons name="chevron-forward" size={24} color="#666A70" />}
                </View>
                <Text className="mt-3 text-zinc-400">{exercise.durationSeconds ? `${exercise.durationSeconds}초 × ${exercise.sets}세트` : `${exercise.reps}회 × ${exercise.sets}세트`}</Text>
                <Text className="mt-3 leading-5 text-zinc-500">• {exercise.cues[0]}</Text>
                <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <View className="h-full bg-iron-orange" style={{ width: `${Math.min(100, (doneSets / exercise.sets) * 100)}%` }} />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PhaseButton({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`flex-1 rounded-xl py-3 ${active ? 'bg-iron-orange' : ''}`}>
      <Text className={`text-center text-xs font-black ${active ? 'text-white' : 'text-zinc-500'}`}>{label}</Text>
    </Pressable>
  );
}

function CorrectionRunner({
  exercise,
  completedSets,
  onBack,
  onComplete,
}: {
  exercise: CorrectionExercise;
  completedSets: number;
  onBack: () => void;
  onComplete: () => Promise<void>;
}) {
  const initialSeconds = exercise.durationSeconds ?? 0;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const done = completedSets >= exercise.sets;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSeconds((current) => Math.max(0, current - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (!running || seconds !== 0) return;
    setRunning(false);
    onComplete().finally(() => setSeconds(initialSeconds));
  }, [initialSeconds, onComplete, running, seconds]);

  async function completeRepSet() {
    await onComplete();
  }

  return (
    <SafeAreaView className="flex-1 bg-iron-bg">
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 24, paddingBottom: 80 }}>
        <Pressable onPress={onBack} className="h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900">
          <Ionicons name="arrow-back" size={22} color="white" />
        </Pressable>

        <Text className="mt-8 text-xs font-black tracking-[3px] text-iron-orange">{exercise.targetMuscle.toUpperCase()}</Text>
        <Text className="mt-2 text-3xl font-black leading-10 text-white">{exercise.name}</Text>
        <Text className="mt-3 text-zinc-400">SET {Math.min(completedSets + 1, exercise.sets)} / {exercise.sets}</Text>

        <View className="mt-8 items-center rounded-[32px] border border-iron-line bg-iron-card p-7">
          {exercise.durationSeconds ? (
            <>
              <Text className="text-xs font-black tracking-[3px] text-zinc-500">COUNTDOWN</Text>
              <Text className="mt-3 text-7xl font-black text-white">{String(seconds).padStart(2, '0')}</Text>
              <Text className="mt-2 text-zinc-500">SECONDS</Text>
              <Pressable disabled={done} onPress={() => setRunning((v) => !v)} className={`mt-7 w-full rounded-2xl py-5 ${done ? 'bg-zinc-800' : 'bg-iron-orange'}`}>
                <Text className={`text-center text-base font-black ${done ? 'text-zinc-500' : 'text-white'}`}>{done ? '완료' : running ? 'PAUSE' : seconds === initialSeconds ? 'START' : 'RESUME'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text className="text-xs font-black tracking-[3px] text-zinc-500">TARGET REPS</Text>
              <Text className="mt-3 text-7xl font-black text-white">{exercise.reps}</Text>
              <Text className="mt-2 text-zinc-500">REPS</Text>
              <Pressable disabled={done} onPress={completeRepSet} className={`mt-7 w-full rounded-2xl py-5 ${done ? 'bg-zinc-800' : 'bg-iron-orange'}`}>
                <Text className={`text-center text-base font-black ${done ? 'text-zinc-500' : 'text-white'}`}>{done ? '모든 세트 완료' : '이 세트 완료'}</Text>
              </Pressable>
            </>
          )}
        </View>

        <View className="mt-5 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <Text className="text-xs font-black tracking-[2px] text-zinc-500">FORM CUES</Text>
          {exercise.cues.map((cue, index) => (
            <View key={cue} className="mt-4 flex-row gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-[#26150f]"><Text className="text-xs font-black text-iron-orange">{index + 1}</Text></View>
              <Text className="flex-1 leading-6 text-zinc-300">{cue}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
