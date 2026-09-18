import type { SQLiteDatabase } from 'expo-sqlite';
import type { AppSettings, PelvicTilt, PreviousPerformance, TrainingTechnique, WorkoutSplit } from '@/src/types';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_sessions (
      id TEXT PRIMARY KEY NOT NULL,
      started_at INTEGER NOT NULL,
      finished_at INTEGER,
      split TEXT,
      body_part TEXT,
      total_volume REAL NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS workout_sets (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      exercise_name TEXT NOT NULL,
      set_number INTEGER NOT NULL,
      weight REAL NOT NULL,
      reps INTEGER NOT NULL,
      rpe REAL,
      technique TEXT NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (session_id) REFERENCES workout_sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sets_exercise_name ON workout_sets(exercise_name);
    CREATE INDEX IF NOT EXISTS idx_sets_exercise_id ON workout_sets(exercise_id);
    CREATE INDEX IF NOT EXISTS idx_sets_completed_at ON workout_sets(completed_at);

    CREATE TABLE IF NOT EXISTS correction_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id TEXT NOT NULL,
      pelvic_tilt TEXT NOT NULL,
      completed_sets INTEGER NOT NULL,
      completed_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_correction_completed_at ON correction_logs(completed_at);
  `);
}

export async function getSetting(db: SQLiteDatabase, key: string) {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(db: SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

export async function loadBootstrapSettings(db: SQLiteDatabase) {
  const [onboarded, pelvicTilt, interlockMode] = await Promise.all([
    getSetting(db, 'onboarded'),
    getSetting(db, 'pelvicTilt'),
    getSetting(db, 'interlockMode'),
  ]);
  return {
    onboarded: onboarded === '1',
    pelvicTilt: (pelvicTilt as PelvicTilt | null) ?? null,
    interlockMode: interlockMode === 'hard' ? 'hard' : 'soft' as AppSettings['interlockMode'],
  };
}

export async function logCorrectionExercise(
  db: SQLiteDatabase,
  exerciseId: string,
  pelvicTilt: PelvicTilt,
  completedSets: number,
) {
  await db.runAsync(
    'INSERT INTO correction_logs (exercise_id, pelvic_tilt, completed_sets, completed_at) VALUES (?, ?, ?, ?)',
    exerciseId,
    pelvicTilt,
    completedSets,
    Date.now(),
  );
}

export async function createWorkoutSession(
  db: SQLiteDatabase,
  id: string,
  split: WorkoutSplit,
  bodyPart: string,
) {
  await db.runAsync(
    'INSERT OR IGNORE INTO workout_sessions (id, started_at, split, body_part, total_volume) VALUES (?, ?, ?, ?, 0)',
    id,
    Date.now(),
    split,
    bodyPart,
  );
}

export async function saveWorkoutSet(
  db: SQLiteDatabase,
  payload: {
    id: string;
    sessionId: string;
    exerciseId: string;
    exerciseName: string;
    setNumber: number;
    weight: number;
    reps: number;
    rpe?: number | null;
    technique: TrainingTechnique;
  },
) {
  await db.runAsync(
    `INSERT INTO workout_sets
      (id, session_id, exercise_id, exercise_name, set_number, weight, reps, rpe, technique, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    payload.id,
    payload.sessionId,
    payload.exerciseId,
    payload.exerciseName,
    payload.setNumber,
    payload.weight,
    payload.reps,
    payload.rpe ?? null,
    payload.technique,
    Date.now(),
  );
}

export async function finishWorkoutSession(db: SQLiteDatabase, sessionId: string, totalVolume: number) {
  await db.runAsync(
    'UPDATE workout_sessions SET finished_at = ?, total_volume = ? WHERE id = ?',
    Date.now(),
    totalVolume,
    sessionId,
  );
}

export async function getLatestExerciseSet(db: SQLiteDatabase, exerciseId: string): Promise<PreviousPerformance | null> {
  const row = await db.getFirstAsync<{
    weight: number;
    reps: number;
    rpe: number | null;
    completed_at: number | null;
  }>(
    `SELECT weight, reps, rpe, completed_at
     FROM workout_sets
     WHERE exercise_id = ?
     ORDER BY completed_at DESC
     LIMIT 1`,
    exerciseId,
  );
  if (!row) return null;
  return { weight: row.weight, reps: row.reps, rpe: row.rpe, completedAt: row.completed_at };
}

export type AnalyticsSnapshot = {
  workoutSets: Array<{
    exerciseId: string;
    exerciseName: string;
    weight: number;
    reps: number;
    completedAt: number;
  }>;
  correctionLogs: Array<{ completedAt: number }>;
  sessions: Array<{ id: string; startedAt: number; finishedAt: number | null; totalVolume: number; bodyPart: string | null }>;
};

export async function getAnalyticsSnapshot(db: SQLiteDatabase, since: number): Promise<AnalyticsSnapshot> {
  const workoutSets = await db.getAllAsync<{
    exercise_id: string;
    exercise_name: string;
    weight: number;
    reps: number;
    completed_at: number;
  }>(
    `SELECT exercise_id, exercise_name, weight, reps, completed_at
     FROM workout_sets
     WHERE completed_at >= ?
     ORDER BY completed_at ASC`,
    since,
  );

  const correctionLogs = await db.getAllAsync<{ completed_at: number }>(
    'SELECT completed_at FROM correction_logs WHERE completed_at >= ? ORDER BY completed_at ASC',
    since,
  );

  const sessions = await db.getAllAsync<{
    id: string;
    started_at: number;
    finished_at: number | null;
    total_volume: number;
    body_part: string | null;
  }>(
    `SELECT id, started_at, finished_at, total_volume, body_part
     FROM workout_sessions
     WHERE started_at >= ?
     ORDER BY started_at DESC`,
    since,
  );

  return {
    workoutSets: workoutSets.map((row) => ({
      exerciseId: row.exercise_id,
      exerciseName: row.exercise_name,
      weight: row.weight,
      reps: row.reps,
      completedAt: row.completed_at,
    })),
    correctionLogs: correctionLogs.map((row) => ({ completedAt: row.completed_at })),
    sessions: sessions.map((row) => ({
      id: row.id,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      totalVolume: row.total_volume,
      bodyPart: row.body_part,
    })),
  };
}
