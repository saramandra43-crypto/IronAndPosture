import type { ExerciseDefinition, RoutinePreset, WorkoutSplit } from '@/src/types';

const exerciseList: ExerciseDefinition[] = [
  { id: 'barbell-bench', name: '바벨 벤치프레스', bodyPart: 'chest', equipment: 'barbell', defaultSets: 4, targetRepMin: 4, targetRepMax: 8, defaultRestSeconds: 150, mainLift: 'bench' },
  { id: 'incline-db-press', name: '인클라인 덤벨프레스', bodyPart: 'chest', equipment: 'dumbbell', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 120 },
  { id: 'pec-deck', name: '펙덱 플라이', bodyPart: 'chest', equipment: 'machine', defaultSets: 3, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 75 },
  { id: 'cable-fly', name: '케이블 플라이', bodyPart: 'chest', equipment: 'cable', defaultSets: 3, targetRepMin: 12, targetRepMax: 15, defaultRestSeconds: 75 },

  { id: 'deadlift', name: '데드리프트', bodyPart: 'back', equipment: 'barbell', defaultSets: 3, targetRepMin: 3, targetRepMax: 6, defaultRestSeconds: 180, mainLift: 'deadlift' },
  { id: 'barbell-row', name: '바벨 로우', bodyPart: 'back', equipment: 'barbell', defaultSets: 4, targetRepMin: 6, targetRepMax: 10, defaultRestSeconds: 120, mainLift: 'row' },
  { id: 'lat-pulldown', name: '랫풀다운', bodyPart: 'back', equipment: 'cable', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 90 },
  { id: 'chest-supported-row', name: '체스트 서포티드 로우', bodyPart: 'back', equipment: 'machine', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 90 },
  { id: 'seated-cable-row', name: '시티드 케이블 로우', bodyPart: 'back', equipment: 'cable', defaultSets: 3, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 90 },

  { id: 'barbell-squat', name: '바벨 스쿼트', bodyPart: 'legs', equipment: 'barbell', defaultSets: 4, targetRepMin: 4, targetRepMax: 8, defaultRestSeconds: 180, mainLift: 'squat' },
  { id: 'hack-squat', name: '핵 스쿼트', bodyPart: 'legs', equipment: 'machine', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 120 },
  { id: 'leg-press', name: '레그프레스', bodyPart: 'legs', equipment: 'machine', defaultSets: 4, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 120 },
  { id: 'romanian-deadlift', name: '루마니안 데드리프트', bodyPart: 'legs', equipment: 'barbell', defaultSets: 4, targetRepMin: 6, targetRepMax: 10, defaultRestSeconds: 120 },
  { id: 'leg-curl', name: '레그컬', bodyPart: 'legs', equipment: 'machine', defaultSets: 4, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 75 },
  { id: 'leg-extension', name: '레그익스텐션', bodyPart: 'legs', equipment: 'machine', defaultSets: 3, targetRepMin: 12, targetRepMax: 15, defaultRestSeconds: 75 },

  { id: 'overhead-press', name: '오버헤드 프레스', bodyPart: 'shoulders', equipment: 'barbell', defaultSets: 4, targetRepMin: 4, targetRepMax: 8, defaultRestSeconds: 150, mainLift: 'overheadPress' },
  { id: 'machine-shoulder-press', name: '머신 숄더프레스', bodyPart: 'shoulders', equipment: 'machine', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 90 },
  { id: 'lateral-raise', name: '사이드 레터럴 레이즈', bodyPart: 'shoulders', equipment: 'dumbbell', defaultSets: 4, targetRepMin: 12, targetRepMax: 20, defaultRestSeconds: 60 },
  { id: 'rear-delt-fly', name: '리어델트 플라이', bodyPart: 'shoulders', equipment: 'machine', defaultSets: 3, targetRepMin: 12, targetRepMax: 20, defaultRestSeconds: 60 },

  { id: 'ez-curl', name: 'EZ바 컬', bodyPart: 'arms', equipment: 'barbell', defaultSets: 4, targetRepMin: 8, targetRepMax: 12, defaultRestSeconds: 75 },
  { id: 'preacher-curl', name: '프리처 컬', bodyPart: 'arms', equipment: 'machine', defaultSets: 3, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 60 },
  { id: 'rope-pushdown', name: '로프 푸시다운', bodyPart: 'arms', equipment: 'cable', defaultSets: 4, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 60 },
  { id: 'overhead-extension', name: '오버헤드 트라이셉스 익스텐션', bodyPart: 'arms', equipment: 'cable', defaultSets: 3, targetRepMin: 10, targetRepMax: 15, defaultRestSeconds: 60 },
];

export const exerciseLibrary = Object.fromEntries(exerciseList.map((exercise) => [exercise.id, exercise])) as Record<string, ExerciseDefinition>;

export const routinePresets: RoutinePreset[] = [
  {
    id: '3DAY', name: '3분할', description: '가슴·어깨 / 등·팔 / 하체',
    days: [
      { id: '3d-push', name: 'DAY 1', focus: '가슴 · 어깨', exerciseIds: ['barbell-bench', 'incline-db-press', 'machine-shoulder-press', 'lateral-raise', 'cable-fly'] },
      { id: '3d-pull', name: 'DAY 2', focus: '등 · 팔', exerciseIds: ['deadlift', 'lat-pulldown', 'chest-supported-row', 'ez-curl', 'rope-pushdown'] },
      { id: '3d-legs', name: 'DAY 3', focus: '하체', exerciseIds: ['barbell-squat', 'hack-squat', 'romanian-deadlift', 'leg-curl', 'leg-extension'] },
    ],
  },
  {
    id: '4DAY', name: '4분할', description: '상체 힘 / 하체 힘 / 상체 볼륨 / 하체 볼륨',
    days: [
      { id: '4d-upper-power', name: 'DAY 1', focus: '상체 · POWER', exerciseIds: ['barbell-bench', 'barbell-row', 'overhead-press', 'lat-pulldown'] },
      { id: '4d-lower-power', name: 'DAY 2', focus: '하체 · POWER', exerciseIds: ['barbell-squat', 'deadlift', 'leg-press', 'leg-curl'] },
      { id: '4d-upper-volume', name: 'DAY 3', focus: '상체 · VOLUME', exerciseIds: ['incline-db-press', 'chest-supported-row', 'machine-shoulder-press', 'lateral-raise', 'ez-curl', 'rope-pushdown'] },
      { id: '4d-lower-volume', name: 'DAY 4', focus: '하체 · VOLUME', exerciseIds: ['hack-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'leg-extension'] },
    ],
  },
  {
    id: '5DAY', name: '5분할', description: '가슴 / 등 / 하체 / 어깨 / 팔',
    days: [
      { id: '5d-chest', name: 'DAY 1', focus: '가슴', exerciseIds: ['barbell-bench', 'incline-db-press', 'pec-deck', 'cable-fly'] },
      { id: '5d-back', name: 'DAY 2', focus: '등', exerciseIds: ['deadlift', 'lat-pulldown', 'chest-supported-row', 'seated-cable-row'] },
      { id: '5d-legs', name: 'DAY 3', focus: '하체', exerciseIds: ['barbell-squat', 'hack-squat', 'leg-press', 'romanian-deadlift', 'leg-curl', 'leg-extension'] },
      { id: '5d-shoulders', name: 'DAY 4', focus: '어깨', exerciseIds: ['overhead-press', 'machine-shoulder-press', 'lateral-raise', 'rear-delt-fly'] },
      { id: '5d-arms', name: 'DAY 5', focus: '팔', exerciseIds: ['ez-curl', 'preacher-curl', 'rope-pushdown', 'overhead-extension'] },
    ],
  },
  {
    id: 'PPL', name: 'PPL', description: 'Push / Pull / Legs',
    days: [
      { id: 'ppl-push', name: 'PUSH', focus: '가슴 · 어깨 · 삼두', exerciseIds: ['barbell-bench', 'incline-db-press', 'overhead-press', 'lateral-raise', 'rope-pushdown'] },
      { id: 'ppl-pull', name: 'PULL', focus: '등 · 이두', exerciseIds: ['deadlift', 'lat-pulldown', 'chest-supported-row', 'seated-cable-row', 'ez-curl'] },
      { id: 'ppl-legs', name: 'LEGS', focus: '하체', exerciseIds: ['barbell-squat', 'hack-squat', 'romanian-deadlift', 'leg-curl', 'leg-extension'] },
    ],
  },
  {
    id: '5X5', name: '5×5', description: '기본 리프트 중심 파워 루틴',
    days: [
      { id: '5x5-a', name: 'WORKOUT A', focus: '5×5 A', exerciseIds: ['barbell-squat', 'barbell-bench', 'barbell-row'] },
      { id: '5x5-b', name: 'WORKOUT B', focus: '5×5 B', exerciseIds: ['barbell-squat', 'overhead-press', 'deadlift'] },
    ],
  },
];

export function getRoutinePreset(split: WorkoutSplit) {
  return routinePresets.find((routine) => routine.id === split) ?? routinePresets[3];
}
