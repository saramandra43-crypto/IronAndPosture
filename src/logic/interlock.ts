import { getCorrectionPreset } from '@/src/data/correctionPresets';
import type { CorrectionExercise, CorrectionProgress, MainLift, PelvicTilt } from '@/src/types';

const liftNeeds: Record<MainLift, CorrectionExercise['type'][]> = {
  squat: ['mobility', 'activation', 'strength'],
  deadlift: ['mobility', 'activation', 'strength'],
  bench: ['mobility', 'activation'],
  overheadPress: ['mobility', 'activation'],
  row: ['mobility', 'activation'],
};

export function getPreLiftCorrection(tilt: PelvicTilt | null, lift: MainLift) {
  const preset = getCorrectionPreset(tilt);
  return preset.filter((exercise) =>
    (exercise.phase === 'pre' || exercise.phase === 'both') && liftNeeds[lift].includes(exercise.type),
  );
}

export function getInterlockProgress(required: CorrectionExercise[], progress: CorrectionProgress[]) {
  if (!required.length) return { completed: 0, total: 0, percent: 100, unlocked: true };
  const completed = required.filter((exercise) =>
    progress.some((item) => item.exerciseId === exercise.id && item.completed),
  ).length;
  const total = required.length;
  return { completed, total, percent: Math.round((completed / total) * 100), unlocked: completed === total };
}
