export type PelvicTilt = 'anterior' | 'posterior' | 'neutral';
export type CorrectionType = 'stretch' | 'mobility' | 'activation' | 'strength';
export type TrainingTechnique = 'normal' | 'drop' | 'superset' | 'descending';
export type WorkoutSplit = '3DAY' | '4DAY' | '5DAY' | 'PPL' | '5X5';
export type MainLift = 'squat' | 'deadlift' | 'bench' | 'overheadPress' | 'row';
export type BodyPart = 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core';
export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export interface CorrectionExercise {
  id: string;
  name: string;
  tilt: PelvicTilt;
  type: CorrectionType;
  targetMuscle: string;
  sets: number;
  durationSeconds?: number;
  reps?: number;
  cues: string[];
  phase: 'pre' | 'post' | 'both';
}

export interface CorrectionProgress {
  exerciseId: string;
  completedSets: number;
  completed: boolean;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  bodyPart: BodyPart;
  equipment: Equipment;
  defaultSets: number;
  targetRepMin: number;
  targetRepMax: number;
  defaultRestSeconds: number;
  mainLift?: MainLift;
}

export interface RoutineDay {
  id: string;
  name: string;
  focus: string;
  exerciseIds: string[];
}

export interface RoutinePreset {
  id: WorkoutSplit;
  name: string;
  description: string;
  days: RoutineDay[];
}

export interface PreviousPerformance {
  weight: number;
  reps: number;
  rpe?: number | null;
  completedAt?: number | null;
}

export interface AppSettings {
  pelvicTilt: PelvicTilt | null;
  defaultRestSeconds: number;
  autoStartRestTimer: boolean;
  restEndSound: boolean;
  interlockEnabled: boolean;
  interlockMode: 'soft' | 'hard';
}
