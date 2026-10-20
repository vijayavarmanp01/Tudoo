import * as SQLite from 'expo-sqlite';

let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<void> | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('tudoo.db');
  }
  return dbInstance;
}

/**
 * Ensures the database connection is open, PRAGMAs configured,
 * base schema created, and all migrations completed.
 * Concurrency-safe: multiple callers share the same initialization promise.
 */
export async function ensureDatabaseInitialized(): Promise<SQLite.SQLiteDatabase> {
  const db = getDatabase();

  if (!initPromise) {
    initPromise = runInitDatabase(db).catch((err) => {
      initPromise = null; // Allow retry on failure
      throw err;
    });
  }

  await initPromise;
  return db;
}

export async function initDatabase(): Promise<void> {
  await ensureDatabaseInitialized();
}

async function runInitDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // Session PRAGMAs
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);

  // Base schema
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_versions (
      version INTEGER PRIMARY KEY NOT NULL,
      appliedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'medium',
      dueDate TEXT,
      dueTime TEXT,
      category TEXT NOT NULL DEFAULT 'Personal',
      subtasksJson TEXT NOT NULL DEFAULT '[]',
      reminderEnabled INTEGER NOT NULL DEFAULT 0,
      reminderNotificationId TEXT,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      completedAt INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
    CREATE INDEX IF NOT EXISTS idx_tasks_dueDate ON tasks(dueDate);
    CREATE INDEX IF NOT EXISTS idx_tasks_createdAt ON tasks(createdAt);

    CREATE TABLE IF NOT EXISTS preferences (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  // Record base schema version 1 if schema_versions is empty
  await db.runAsync(
    'INSERT OR IGNORE INTO schema_versions (version, appliedAt) VALUES (1, ?)',
    [Date.now()]
  );

  // Run versioned migrations
  await runMigrations(db);
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersionRow = await db.getFirstAsync<{ version: number }>(
    'SELECT MAX(version) as version FROM schema_versions'
  );
  const currentVersion = currentVersionRow?.version ?? 1;

  // Migration 2: Daily Guardian, Recurring Routines, Occurrences, Reminders
  if (currentVersion < 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS routines (
          id TEXT PRIMARY KEY NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          enabled INTEGER NOT NULL DEFAULT 1,
          scheduledTime TEXT NOT NULL DEFAULT '08:00',
          deadlineTime TEXT,
          category TEXT NOT NULL DEFAULT 'Personal',
          priority TEXT NOT NULL DEFAULT 'medium',
          daysOfWeekJson TEXT NOT NULL DEFAULT '[0,1,2,3,4,5,6]',
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_routines_enabled ON routines(enabled);

        CREATE TABLE IF NOT EXISTS reminder_configs (
          id TEXT PRIMARY KEY NOT NULL,
          routineId TEXT NOT NULL UNIQUE,
          enabled INTEGER NOT NULL DEFAULT 1,
          initialAlarmTime TEXT NOT NULL DEFAULT '08:00',
          followUpIntervalMinutes INTEGER NOT NULL DEFAULT 15,
          maxReminders INTEGER NOT NULL DEFAULT 3,
          snoozeMinutes INTEGER NOT NULL DEFAULT 10,
          cutoffTime TEXT,
          quietHoursStart TEXT,
          quietHoursEnd TEXT,
          soundName TEXT NOT NULL DEFAULT 'gentle_bell',
          vibrationEnabled INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS routine_occurrences (
          id TEXT PRIMARY KEY NOT NULL,
          routineId TEXT NOT NULL,
          localDate TEXT NOT NULL,
          scheduledTime TEXT NOT NULL,
          deadlineTime TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          completedAt INTEGER,
          reminderCount INTEGER NOT NULL DEFAULT 0,
          createdAt INTEGER NOT NULL,
          updatedAt INTEGER NOT NULL,
          UNIQUE (routineId, localDate),
          FOREIGN KEY (routineId) REFERENCES routines(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_occurrences_date_status ON routine_occurrences(localDate, status);
        CREATE INDEX IF NOT EXISTS idx_occurrences_routine_date ON routine_occurrences(routineId, localDate);

        CREATE TABLE IF NOT EXISTS reminder_history (
          id TEXT PRIMARY KEY NOT NULL,
          occurrenceId TEXT NOT NULL,
          routineId TEXT NOT NULL,
          scheduledTime INTEGER NOT NULL,
          triggeredAt INTEGER,
          reminderIndex INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'scheduled',
          notificationId TEXT,
          createdAt INTEGER NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_reminder_history_occ ON reminder_history(occurrenceId);
      `);

      await db.runAsync(
        'INSERT OR REPLACE INTO schema_versions (version, appliedAt) VALUES (2, ?)',
        [Date.now()]
      );
    });
  }
}
