import { ensureDatabaseInitialized } from './database';
import { Routine } from '../types/routine';
import { Priority, Category } from '../types/task';

interface RoutineRow {
  id: string;
  title: string;
  description: string | null;
  enabled: number;
  scheduledTime: string;
  deadlineTime: string | null;
  category: string;
  priority: string;
  daysOfWeekJson: string;
  createdAt: number;
  updatedAt: number;
}

function rowToRoutine(row: RoutineRow): Routine {
  let days: number[] = [0, 1, 2, 3, 4, 5, 6];
  try {
    if (row.daysOfWeekJson) {
      days = JSON.parse(row.daysOfWeekJson);
    }
  } catch {
    days = [0, 1, 2, 3, 4, 5, 6];
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    enabled: row.enabled === 1,
    scheduledTime: row.scheduledTime,
    deadlineTime: row.deadlineTime ?? undefined,
    category: (row.category as Category) || 'Personal',
    priority: (row.priority as Priority) || 'medium',
    daysOfWeek: days,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

const DEFAULT_ROUTINES: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'Morning Routine',
    description: '3 tasks · Daily mindfulness & prep',
    enabled: true,
    scheduledTime: '07:00',
    category: 'Health',
    priority: 'high',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    title: 'Workout',
    description: '2 tasks · Strength & cardio',
    enabled: true,
    scheduledTime: '08:30',
    category: 'Health',
    priority: 'medium',
    daysOfWeek: [1, 3, 5],
  },
  {
    title: 'Study Time',
    description: '2 tasks · Focused learning session',
    enabled: true,
    scheduledTime: '16:00',
    category: 'Study',
    priority: 'medium',
    daysOfWeek: [1, 2, 3, 4, 5],
  },
  {
    title: 'Evening Routine',
    description: '4 tasks · Wind-down & reflect',
    enabled: true,
    scheduledTime: '21:00',
    category: 'Personal',
    priority: 'low',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
];

export const routineRepository = {
  async getAllRoutines(): Promise<Routine[]> {
    const db = await ensureDatabaseInitialized();
    const rows = await db.getAllAsync<RoutineRow>('SELECT * FROM routines ORDER BY scheduledTime ASC');

    if (rows.length === 0) {
      // Seed default routines matching mockup Screen 5
      const now = Date.now();
      for (let i = 0; i < DEFAULT_ROUTINES.length; i++) {
        const item = DEFAULT_ROUTINES[i];
        const id = 'routine_' + (i + 1);
        await db.runAsync(
          `INSERT INTO routines (
            id, title, description, enabled, scheduledTime, deadlineTime,
            category, priority, daysOfWeekJson, createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.title,
            item.description ?? null,
            item.enabled ? 1 : 0,
            item.scheduledTime,
            item.deadlineTime ?? null,
            item.category,
            item.priority,
            JSON.stringify(item.daysOfWeek),
            now + i,
            now + i,
          ]
        );
      }
      const seeded = await db.getAllAsync<RoutineRow>('SELECT * FROM routines ORDER BY scheduledTime ASC');
      return seeded.map(rowToRoutine);
    }

    return rows.map(rowToRoutine);
  },

  async toggleRoutine(id: string, enabled: boolean): Promise<void> {
    const db = await ensureDatabaseInitialized();
    await db.runAsync(
      'UPDATE routines SET enabled = ?, updatedAt = ? WHERE id = ?',
      [enabled ? 1 : 0, Date.now(), id]
    );
  },

  async insertRoutine(routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Routine> {
    const db = await ensureDatabaseInitialized();
    const now = Date.now();
    const id = 'routine_' + Math.random().toString(36).substring(2, 9) + '_' + now;

    await db.runAsync(
      `INSERT INTO routines (
        id, title, description, enabled, scheduledTime, deadlineTime,
        category, priority, daysOfWeekJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        routine.title.trim(),
        routine.description ? routine.description.trim() : null,
        routine.enabled ? 1 : 0,
        routine.scheduledTime,
        routine.deadlineTime ?? null,
        routine.category,
        routine.priority,
        JSON.stringify(routine.daysOfWeek),
        now,
        now,
      ]
    );

    return {
      ...routine,
      id,
      createdAt: now,
      updatedAt: now,
    };
  },

  async deleteRoutine(id: string): Promise<void> {
    const db = await ensureDatabaseInitialized();
    await db.runAsync('DELETE FROM routines WHERE id = ?', [id]);
  },
};
