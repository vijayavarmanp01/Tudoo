import { ensureDatabaseInitialized } from './database';
import { Task, Priority, Category, Subtask, DayActivity } from '../types/task';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  completed: number;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
  category: string;
  subtasksJson: string;
  reminderEnabled: number;
  reminderNotificationId: string | null;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

function rowToTask(row: TaskRow): Task {
  let subtasks: Subtask[] = [];
  try {
    if (row.subtasksJson) {
      subtasks = JSON.parse(row.subtasksJson);
    }
  } catch {
    subtasks = [];
  }

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    completed: row.completed === 1,
    priority: (row.priority as Priority) || 'medium',
    dueDate: row.dueDate ?? undefined,
    dueTime: row.dueTime ?? undefined,
    category: (row.category as Category) || 'Personal',
    subtasks,
    reminderEnabled: row.reminderEnabled === 1,
    reminderNotificationId: row.reminderNotificationId ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    completedAt: row.completedAt,
  };
}

function getLocalDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const taskRepository = {
  async getAllTasks(): Promise<Task[]> {
    const db = await ensureDatabaseInitialized();
    const rows = await db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks ORDER BY completed ASC, CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 ELSE 4 END ASC, dueDate ASC, createdAt DESC"
    );
    return rows.map(rowToTask);
  },

  async getTaskById(id: string): Promise<Task | null> {
    const db = await ensureDatabaseInitialized();
    const row = await db.getFirstAsync<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
    return row ? rowToTask(row) : null;
  },

  async insertTask(task: Task): Promise<void> {
    const db = await ensureDatabaseInitialized();
    await db.runAsync(
      `INSERT INTO tasks (
        id, title, description, completed, priority, dueDate, dueTime,
        category, subtasksJson, reminderEnabled, reminderNotificationId,
        createdAt, updatedAt, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.title.trim(),
        task.description ? task.description.trim() : null,
        task.completed ? 1 : 0,
        task.priority,
        task.dueDate || null,
        task.dueTime || null,
        task.category,
        JSON.stringify(task.subtasks || []),
        task.reminderEnabled ? 1 : 0,
        task.reminderNotificationId || null,
        task.createdAt,
        task.updatedAt,
        task.completedAt || null,
      ]
    );
  },

  async updateTask(task: Task): Promise<void> {
    const db = await ensureDatabaseInitialized();
    await db.runAsync(
      `UPDATE tasks SET
        title = ?,
        description = ?,
        completed = ?,
        priority = ?,
        dueDate = ?,
        dueTime = ?,
        category = ?,
        subtasksJson = ?,
        reminderEnabled = ?,
        reminderNotificationId = ?,
        updatedAt = ?,
        completedAt = ?
      WHERE id = ?`,
      [
        task.title.trim(),
        task.description ? task.description.trim() : null,
        task.completed ? 1 : 0,
        task.priority,
        task.dueDate || null,
        task.dueTime || null,
        task.category,
        JSON.stringify(task.subtasks || []),
        task.reminderEnabled ? 1 : 0,
        task.reminderNotificationId || null,
        Date.now(),
        task.completed ? (task.completedAt || Date.now()) : null,
        task.id,
      ]
    );
  },

  async toggleTaskCompletion(id: string, completed: boolean): Promise<Task | null> {
    const db = await ensureDatabaseInitialized();
    const now = Date.now();
    await db.runAsync(
      `UPDATE tasks SET
        completed = ?,
        completedAt = ?,
        updatedAt = ?
      WHERE id = ?`,
      [completed ? 1 : 0, completed ? now : null, now, id]
    );
    return this.getTaskById(id);
  },

  async deleteTask(id: string): Promise<void> {
    const db = await ensureDatabaseInitialized();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
  },

  async clearCompletedTasks(): Promise<number> {
    const db = await ensureDatabaseInitialized();
    const result = await db.runAsync('DELETE FROM tasks WHERE completed = 1');
    return result.changes;
  },

  async getWeeklyActivity(): Promise<DayActivity[]> {
    const db = await ensureDatabaseInitialized();
    const days: DayActivity[] = [];
    const now = new Date();

    // Past 7 days (including today)
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      // Start and end timestamp of this date in local time
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

      const completedRow = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND completedAt >= ? AND completedAt <= ?',
        [startOfDay, endOfDay]
      );

      const createdRow = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM tasks WHERE createdAt >= ? AND createdAt <= ?',
        [startOfDay, endOfDay]
      );

      days.push({
        date: dateStr,
        dayLabel,
        completedCount: completedRow?.count ?? 0,
        totalCreated: createdRow?.count ?? 0,
      });
    }

    return days;
  },

  async getStats(): Promise<{
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    completedThisWeek: number;
    totalCompleted: number;
    completionRate: number;
  }> {
    const db = await ensureDatabaseInitialized();
    const totalRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks');
    const total = totalRow?.count ?? 0;

    const completedRow = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM tasks WHERE completed = 1');
    const totalCompleted = completedRow?.count ?? 0;
    const activeTasks = total - totalCompleted;

    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const todayRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND completedAt >= ?',
      [startOfToday]
    );
    const completedToday = todayRow?.count ?? 0;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const weekRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE completed = 1 AND completedAt >= ?',
      [oneWeekAgo]
    );
    const completedThisWeek = weekRow?.count ?? 0;

    const completionRate = total > 0 ? Math.round((totalCompleted / total) * 100) : 0;

    return {
      totalTasks: total,
      activeTasks,
      completedToday,
      completedThisWeek,
      totalCompleted,
      completionRate,
    };
  },
};
