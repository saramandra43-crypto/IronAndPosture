import type { PreviousPerformance } from '@/src/types';

export function comparePerformance(weight: number, reps: number, previous?: PreviousPerformance | null) {
  if (!previous) return { tone: 'neutral' as const, label: '첫 기록' };
  if (weight > previous.weight) return { tone: 'up' as const, label: `+${trim(weight - previous.weight)} kg` };
  if (weight === previous.weight && reps > previous.reps) return { tone: 'up' as const, label: `+${reps - previous.reps} REP` };
  if (weight === previous.weight && reps === previous.reps) return { tone: 'same' as const, label: '지난 기록과 동일' };
  return { tone: 'down' as const, label: '지난 기록 미만' };
}

function trim(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
