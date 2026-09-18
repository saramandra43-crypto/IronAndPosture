import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { RestTimer } from '@/src/components/RestTimer';
import { exerciseLibrary, getRoutinePreset, routinePresets } from '@/src/data/workoutPresets';
import { createWorkoutSession, finishWorkoutSession, getLatestExerciseSet, saveWorkoutSet } from '@/src/db/database';
import { getInterlockProgress, getPreLiftCorrection } from '@/src/logic/interlock';
import { calculateOneRM } from '@/src/logic/oneRM';
import { comparePerformance } from '@/src/logic/overload';
import { useIronStore } from '@/src/store/useIronStore';
import type { ExerciseDefinition, PreviousPerformance, TrainingTechnique, WorkoutSplit } from '@/src/types';

type ExerciseInput = {
  weight: string;
  reps: string;
  rpe: string;
  technique: TrainingTechnique;
};

const techniqueLabels: Record<TrainingTechnique, string> = {
  normal: 'NORMAL',
  drop: 'DROP',
  superset: 'SUPER',
  descending: 'DESC',
};

export default function WorkoutScreen() {
  const db = useSQLiteContext();
  const tilt = useIronStore((s) => s.settings.pelvicTilt);
  const settings = useIronStore((s) => s.settings);
  const correctionProgress = useIronStore((s) => s.correctionProgress);
  const startRest = useIronStore((s) => s.startRestTimer);

  const [split, setSplit] = useState<WorkoutSplit>('PPL');
  const [dayIndex, setDayIndex] = useState(0);
  const [inputs, setInputs] = useState<Record<string, ExerciseInput>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, number>>({});
  const [previous, setPrevious] = useState<Record<string, PreviousPerformance | null>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [totalVolume, setTotalVolume] = useState(0);
  const [volumeByPart, setVolumeByPart] = useState<Record<string, number>>({});

  const routine = getRoutinePreset(split);
  const day = routine.days[Math.min(dayIndex, routine.days.length - 1)];
  const exercises = useMemo(
    () => day.exerciseIds.map((id) => exerciseLibrary[id]).filter(Boolean),
    [day.exerciseIds],
  );

  useEffect(() => {
    let cancelled = false;
    Promise.all(exercises.map(async (exercise) => [exercise.id, await getLatestExerciseSet(db, exercise.id)] as const))
      .then((rows) => {
        if (cancelled) return;
        const nextPrevious = Object.fromEntries(rows) as Record<string, PreviousPerformance | null>;
        setPrevious(nextPrevious);
        setInputs((current) => {
          const next = { ...current };
          for (const exercise of exercises) {
            if (!next[exercise.id]) {
              const last = nextPrevious[exercise.id];
              next[exercise.id] = {
                weight: last ? String(last.weight) : '',
                reps: split === '5X5' ? '5' : String(exercise.targetRepMin),
                rpe: last?.rpe ? String(last.rpe) : '8',
                technique: 'normal',
              };
            }
          }
          return next;
        });
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [db, exercises, split]);

  function chooseSplit(next: WorkoutSplit) {
    if (sessionId) return;
    setSplit(next);
    setDayIndex(0);
    setCompletedSets({});
    setTotalVolume(0);
    setVolumeByPart({});
  }

  function chooseDay(index: number) {
    if (sessionId) return;
    setDayIndex(index);
    setCompletedSets({});
    setTotalVolume(0);
    setVolumeByPart({});
  }

  function updateInput(exerciseId: string, patch: Partial<ExerciseInput>) {
    setInputs((current) => ({
      ...current,
      [exerciseId]: {
        weight: '', reps: '', rpe: '8', technique: 'normal',
        ...current[exerciseId],
        ...patch,
      },
    }));
  }

  function targetSets(exercise: ExerciseDefinition) {
    if (split === '5X5') return exercise.id === 'deadlift' ? 1 : 5;
    return exercise.defaultSets;
  }

  async function completeSet(exercise: ExerciseDefinition) {
    const input = inputs[exercise.id] ?? { weight: '', reps: '', rpe: '8', technique: 'normal' as TrainingTechnique };
    const weight = Number(input.weight);
    const reps = Number(input.reps);
    const rpe = input.rpe ? Number(input.rpe) : null;

    if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(reps) || reps <= 0) {
      Alert.alert('중량과 횟수를 확인해줘', 'KG와 REPS는 0보다 큰 숫자로 입력해야 해.');
      return;
    }
    if (rpe !== null && (!Number.isFinite(rpe) || rpe < 1 || rpe > 10)) {
      Alert.alert('RPE를 확인해줘', 'RPE는 1~10 사이로 입력해줘.');
      return;
    }

    if (exercise.mainLift && settings.interlockEnabled) {
      const gate = getInterlockProgress(getPreLiftCorrection(tilt, exercise.mainLift), correctionProgress);
      if (!gate.unlocked && settings.interlockMode === 'hard') {
        Alert.alert('POSTURE INTERLOCK', `준비운동이 ${gate.completed}/${gate.total} 완료됐어. 교정 탭의 PREP을 먼저 끝내줘.`);
        return;
      }
    }

    const setNumber = (completedSets[exercise.id] ?? 0) + 1;
    const maxSets = targetSets(exercise);
    if (setNumber > maxSets) {
      Alert.alert('목표 세트 완료', '이 종목은 이미 오늘 목표 세트를 모두 끝냈어.');
      return;
    }

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = `session-${Date.now()}`;
      await createWorkoutSession(db, activeSessionId, split, day.focus);
      setSessionId(activeSessionId);
    }

    await saveWorkoutSet(db, {
      id: `${activeSessionId}-${exercise.id}-${setNumber}-${Date.now()}`,
      sessionId: activeSessionId,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      setNumber,
      weight,
      reps,
      rpe,
      technique: input.technique,
    });

    setCompletedSets((current) => ({ ...current, [exercise.id]: setNumber }));
    const setVolume = weight * reps;
    setTotalVolume((current) => current + setVolume);
    setVolumeByPart((current) => ({ ...current, [exercise.bodyPart]: (current[exercise.bodyPart] ?? 0) + setVolume }));
    startRest(exercise.defaultRestSeconds);
  }

  async function finishSession() {
    if (!sessionId) {
      Alert.alert('아직 기록이 없어', '한 세트 이상 완료한 뒤 세션을 종료할 수 있어.');
      return;
    }
    await finishWorkoutSession(db, sessionId, totalVolume);
    Alert.alert('운동 저장 완료', `총 볼륨 ${Math.round(totalVolume).toLocaleString()} kg을 저장했어.`);
    setSessionId(null);
    setCompletedSets({});
    setTotalVolume(0);
    setVolumeByPart({});
    const rows = await Promise.all(exercises.map(async (exercise) => [exercise.id, await getLatestExerciseSet(db, exercise.id)] as const));
    setPrevious(Object.fromEntries(rows));
  }

  return (
    <SafeAreaView className="flex-1 bg-iron-bg">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View className="px-5 pt-8">
          <Text className="text-xs font-black tracking-[3px] text-zinc-500">HARD TRAINING</Text>
          <Text className="mt-2 text-3xl font-black text-white">오늘의 웨이트</Text>
          <Text className="mt-2 text-zinc-500">세트 · 중량 · RPE · 특수세트 · 휴식까지 한 화면에서 기록.</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, marginTop: 22 }}>
          {routinePresets.map((item) => (
            <Pressable
              key={item.id}
              disabled={!!sessionId}
              onPress={() => chooseSplit(item.id)}
              className={`rounded-2xl border px-4 py-3 ${split === item.id ? 'border-iron-orange bg-[#26150f]' : 'border-iron-line bg-iron-card'} ${sessionId ? 'opacity-60' : ''}`}
            >
              <Text className={`font-black ${split === item.id ? 'text-iron-orange' : 'text-zinc-300'}`}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View className="mx-5 mt-4 rounded-[28px] border border-iron-line bg-iron-card p-5">
          <Text className="text-xs font-black tracking-[2px] text-iron-orange">{routine.name}</Text>
          <Text className="mt-1 text-zinc-400">{routine.description}</Text>
          {sessionId && <Text className="mt-3 text-xs font-bold text-zinc-600">세션 진행 중에는 루틴/요일 변경이 잠겨.</Text>}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 16 }}>
            {routine.days.map((item, index) => (
              <Pressable
                key={item.id}
                disabled={!!sessionId}
                onPress={() => chooseDay(index)}
                className={`rounded-xl px-4 py-3 ${dayIndex === index ? 'bg-iron-orange' : 'bg-zinc-900'} ${sessionId ? 'opacity-60' : ''}`}
              >
                <Text className={`text-xs font-black ${dayIndex === index ? 'text-white' : 'text-zinc-400'}`}>{item.name}</Text>
                <Text className={`mt-1 text-[10px] ${dayIndex === index ? 'text-orange-100' : 'text-zinc-600'}`}>{item.focus}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mx-5 mt-5 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-zinc-900 p-4">
            <Text className="text-xs font-bold text-zinc-500">TODAY VOLUME</Text>
            <Text className="mt-1 text-2xl font-black text-white">{Math.round(totalVolume).toLocaleString()} kg</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-zinc-900 p-4">
            <Text className="text-xs font-bold text-zinc-500">SETS DONE</Text>
            <Text className="mt-1 text-2xl font-black text-white">{Object.values(completedSets).reduce((a, b) => a + b, 0)}</Text>
          </View>
        </View>

        {Object.keys(volumeByPart).length > 0 && (
          <View className="mx-5 mt-3 rounded-2xl bg-zinc-900 p-4">
            <Text className="text-[10px] font-black tracking-[2px] text-zinc-600">BODY PART VOLUME · LIVE</Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {Object.entries(volumeByPart).map(([part, volume]) => (
                <View key={part} className="rounded-xl bg-[#17191d] px-3 py-2">
                  <Text className="text-[10px] font-black text-zinc-500">{part.toUpperCase()}</Text>
                  <Text className="mt-1 font-black text-white">{Math.round(volume).toLocaleString()} kg</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="mx-5 mt-5 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              input={inputs[exercise.id] ?? { weight: '', reps: split === '5X5' ? '5' : String(exercise.targetRepMin), rpe: '8', technique: 'normal' }}
              completedSets={completedSets[exercise.id] ?? 0}
              targetSets={targetSets(exercise)}
              previous={previous[exercise.id]}
              interlock={exercise.mainLift ? getInterlockProgress(getPreLiftCorrection(tilt, exercise.mainLift), correctionProgress) : null}
              hardLocked={!!exercise.mainLift && settings.interlockMode === 'hard'}
              onChange={(patch) => updateInput(exercise.id, patch)}
              onComplete={() => completeSet(exercise)}
            />
          ))}
        </View>

        <View className="mx-5 mt-5"><RestTimer /></View>

        <Pressable onPress={finishSession} className={`mx-5 mt-5 rounded-2xl py-5 ${sessionId ? 'bg-white' : 'bg-zinc-800'}`}>
          <Text className={`text-center text-base font-black ${sessionId ? 'text-black' : 'text-zinc-600'}`}>오늘 운동 종료 · 저장</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExerciseCard({
  exercise,
  input,
  completedSets,
  targetSets,
  previous,
  interlock,
  hardLocked,
  onChange,
  onComplete,
}: {
  exercise: ExerciseDefinition;
  input: ExerciseInput;
  completedSets: number;
  targetSets: number;
  previous?: PreviousPerformance | null;
  interlock: ReturnType<typeof getInterlockProgress> | null;
  hardLocked: boolean;
  onChange: (patch: Partial<ExerciseInput>) => void;
  onComplete: () => void | Promise<void>;
}) {
  const weight = Number(input.weight) || 0;
  const reps = Number(input.reps) || 0;
  const oneRM = calculateOneRM(weight, reps);
  const overload = comparePerformance(weight, reps, previous);
  const done = completedSets >= targetSets;
  const locked = !!interlock && hardLocked && !interlock.unlocked;

  return (
    <View className="rounded-[28px] border border-iron-line bg-iron-card p-5">
      <View className="flex-row items-start justify-between gap-4">
        <View className="flex-1">
          <Text className="text-[10px] font-black tracking-[2px] text-iron-orange">{exercise.bodyPart.toUpperCase()} · {exercise.equipment.toUpperCase()}</Text>
          <Text className="mt-1 text-xl font-black text-white">{exercise.name}</Text>
          <Text className="mt-1 text-xs text-zinc-500">목표 {exercise.targetRepMin}–{exercise.targetRepMax}회 · 휴식 {Math.round(exercise.defaultRestSeconds / 30) * 0.5}분</Text>
        </View>
        <View className="rounded-xl bg-zinc-900 px-3 py-2"><Text className="text-xs font-black text-zinc-300">{completedSets}/{targetSets}</Text></View>
      </View>

      {interlock && (
        <View className={`mt-4 rounded-2xl border p-4 ${interlock.unlocked ? 'border-zinc-800 bg-zinc-900' : 'border-[#4a281c] bg-[#21140f]'}`}>
          <View className="flex-row items-center justify-between">
            <Text className={`text-xs font-black ${interlock.unlocked ? 'text-zinc-400' : 'text-iron-orange'}`}>POSTURE INTERLOCK</Text>
            <Text className={`text-xs font-black ${interlock.unlocked ? 'text-zinc-300' : 'text-iron-orange'}`}>{interlock.percent}%</Text>
          </View>
          {!interlock.unlocked && <Text className="mt-2 text-xs leading-5 text-zinc-500">PREP {interlock.completed}/{interlock.total} 완료 · {hardLocked ? '완료 전 메인 리프트 잠금' : 'Soft 모드: 경고 후 진행 가능'}</Text>}
        </View>
      )}

      <View className="mt-4 flex-row gap-3">
        <InputBox label="KG" value={input.weight} onChange={(weightValue) => onChange({ weight: weightValue })} keyboard="decimal-pad" />
        <InputBox label="REPS" value={input.reps} onChange={(repsValue) => onChange({ reps: repsValue })} keyboard="number-pad" />
        <InputBox label="RPE" value={input.rpe} onChange={(rpeValue) => onChange({ rpe: rpeValue })} keyboard="decimal-pad" />
      </View>

      <View className="mt-4 flex-row gap-2">
        {(Object.keys(techniqueLabels) as TrainingTechnique[]).map((technique) => (
          <Pressable
            key={technique}
            onPress={() => onChange({ technique })}
            className={`flex-1 rounded-xl py-2.5 ${input.technique === technique ? 'bg-[#26150f]' : 'bg-zinc-900'}`}
          >
            <Text className={`text-center text-[10px] font-black ${input.technique === technique ? 'text-iron-orange' : 'text-zinc-600'}`}>{techniqueLabels[technique]}</Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-4 flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-zinc-900 p-4">
          <Text className="text-[10px] font-black text-zinc-600">EST. 1RM</Text>
          <Text className="mt-1 text-xl font-black text-white">{oneRM} kg</Text>
        </View>
        <View className="flex-1 rounded-2xl bg-zinc-900 p-4">
          <Text className="text-[10px] font-black text-zinc-600">LAST SET</Text>
          <Text className="mt-1 text-sm font-black text-white">{previous ? `${previous.weight} × ${previous.reps}` : 'NO DATA'}</Text>
          <Text className={`mt-1 text-[10px] font-black ${overload.tone === 'up' ? 'text-iron-orange' : overload.tone === 'down' ? 'text-zinc-600' : 'text-zinc-500'}`}>{overload.label}</Text>
        </View>
      </View>

      <Pressable disabled={done || locked} onPress={onComplete} className={`mt-5 rounded-2xl py-4 ${done || locked ? 'bg-zinc-800' : 'bg-iron-orange'}`}>
        <Text className={`text-center font-black ${done || locked ? 'text-zinc-600' : 'text-white'}`}>
          {done ? '목표 세트 완료' : locked ? 'PREP 완료 후 잠금 해제' : `SET ${completedSets + 1} 완료 · 휴식 ${exercise.defaultRestSeconds}초`}
        </Text>
      </Pressable>
    </View>
  );
}

function InputBox({ label, value, onChange, keyboard }: { label: string; value: string; onChange: (value: string) => void; keyboard: 'decimal-pad' | 'number-pad' }) {
  return (
    <View className="flex-1">
      <Text className="mb-2 text-[10px] font-black tracking-[1px] text-zinc-600">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard}
        selectTextOnFocus
        className="rounded-2xl bg-zinc-900 px-3 py-4 text-center text-lg font-black text-white"
        placeholder="0"
        placeholderTextColor="#4B4B52"
      />
    </View>
  );
}
