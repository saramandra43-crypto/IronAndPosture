import { create } from 'zustand';
import type { AppSettings, CorrectionProgress, PelvicTilt } from '@/src/types';

type HydratePayload = {
  onboarded: boolean;
  pelvicTilt: PelvicTilt | null;
  interlockMode?: AppSettings['interlockMode'];
};

type IronState = {
  hydrated: boolean;
  onboarded: boolean;
  settings: AppSettings;
  correctionProgress: CorrectionProgress[];
  restTimeLeft: number;
  restTimerRunning: boolean;
  restEndsAt: number | null;
  hydrate: (payload: HydratePayload) => void;
  setPelvicTilt: (tilt: PelvicTilt) => void;
  setInterlockMode: (mode: AppSettings['interlockMode']) => void;
  completeOnboarding: () => void;
  completeCorrectionSet: (exerciseId: string, totalSets: number) => void;
  resetCorrection: () => void;
  startRestTimer: (seconds: number) => void;
  tickRestTimer: () => void;
  stopRestTimer: () => void;
};

export const useIronStore = create<IronState>()((set, get) => ({
  hydrated: false,
  onboarded: false,
  settings: {
    pelvicTilt: null,
    defaultRestSeconds: 90,
    autoStartRestTimer: true,
    restEndSound: true,
    interlockEnabled: true,
    interlockMode: 'soft',
  },
  correctionProgress: [],
  restTimeLeft: 0,
  restTimerRunning: false,
  restEndsAt: null,

  hydrate: ({ onboarded, pelvicTilt, interlockMode }) => set((state) => ({
    hydrated: true,
    onboarded,
    settings: {
      ...state.settings,
      pelvicTilt,
      interlockMode: interlockMode ?? state.settings.interlockMode,
    },
  })),

  setPelvicTilt: (pelvicTilt) => set((state) => ({
    settings: { ...state.settings, pelvicTilt },
    correctionProgress: [],
  })),

  setInterlockMode: (interlockMode) => set((state) => ({
    settings: { ...state.settings, interlockMode },
  })),

  completeOnboarding: () => set({ onboarded: true }),

  completeCorrectionSet: (exerciseId, totalSets) => set((state) => {
    const found = state.correctionProgress.find((item) => item.exerciseId === exerciseId);
    const completedSets = Math.min((found?.completedSets ?? 0) + 1, totalSets);
    const next = { exerciseId, completedSets, completed: completedSets >= totalSets };
    return {
      correctionProgress: found
        ? state.correctionProgress.map((item) => item.exerciseId === exerciseId ? next : item)
        : [...state.correctionProgress, next],
    };
  }),

  resetCorrection: () => set({ correctionProgress: [] }),

  startRestTimer: (seconds) => {
    const safeSeconds = Math.max(1, Math.round(seconds));
    set({
      restTimeLeft: safeSeconds,
      restTimerRunning: true,
      restEndsAt: Date.now() + safeSeconds * 1000,
    });
  },

  tickRestTimer: () => {
    const { restEndsAt, restTimerRunning } = get();
    if (!restTimerRunning || !restEndsAt) return;
    const next = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
    set({
      restTimeLeft: next,
      restTimerRunning: next > 0,
      // Keep restEndsAt on natural completion so the scheduled notification is not cancelled at 0.
      restEndsAt,
    });
  },

  stopRestTimer: () => set({ restTimeLeft: 0, restTimerRunning: false, restEndsAt: null }),
}));
