import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Task, DayActivity, DayProgress } from '../types/task';
import { taskRepository } from '../db/taskRepository';
import { ensureDatabaseInitialized } from '../db/database';
import { notificationsService } from '../services/notifications';
import { hapticsService } from '../services/haptics';
import { useSettings } from './SettingsContext';

interface TaskContextValue {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  addTask: (data: Partial<Task> & { title: string }) => Promise<Task>;
  updateTask: (task: Task) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  clearCompleted: () => Promise<number>;
  stats: {
    totalTasks: number;
    activeTasks: number;
    completedToday: number;
    completedThisWeek: number;
    totalCompleted: number;
    completionRate: number;
  };
  weeklyActivity: DayActivity[];
  todayProgress: DayProgress;
  showCelebration: boolean;
  closeCelebration: () => void;
  triggerCelebration: () => void;
}

const defaultStats = {
  totalTasks: 0,
  activeTasks: 0,
  completedToday: 0,
  completedThisWeek: 0,
  totalCompleted: 0,
  completionRate: 0,
};

const TaskContext = createContext<TaskContextValue>({
  tasks: [],
  loading: true,
  error: null,
  refreshTasks: async () => {},
  addTask: async () => { throw new Error('Not implemented'); },
  updateTask: async () => {},
  toggleTask: async () => {},
  deleteTask: async () => {},
  clearCompleted: async () => 0,
  stats: defaultStats,
  weeklyActivity: [],
  todayProgress: { total: 0, completed: 0, percentage: 0 },
  showCelebration: false,
  closeCelebration: () => {},
  triggerCelebration: () => {},
});

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = useSettings();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(defaultStats);
  const [weeklyActivity, setWeeklyActivity] = useState<DayActivity[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  const refreshTasks = useCallback(async () => {
    try {
      const all = await taskRepository.getAllTasks();
      const currentStats = await taskRepository.getStats();
      const weekly = await taskRepository.getWeeklyActivity();

      setTasks(all);
      setStats(currentStats);
      setWeeklyActivity(weekly);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load tasks from SQLite:', err);
      setError(err?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const initialize = async () => {
      try {
        await ensureDatabaseInitialized();
        await notificationsService.init();
        if (mounted) {
          await refreshTasks();
        }
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Database initialization error');
          setLoading(false);
        }
      }
    };
    initialize();
    return () => {
      mounted = false;
    };
  }, [refreshTasks]);

  const addTask = async (data: Partial<Task> & { title: string }): Promise<Task> => {
    const now = Date.now();
    const id = 'task_' + Math.random().toString(36).substring(2, 9) + '_' + now;

    let initialTask: Task = {
      id,
      title: data.title.trim(),
      description: data.description?.trim(),
      completed: false,
      priority: data.priority || 'medium',
      dueDate: data.dueDate,
      dueTime: data.dueTime,
      category: data.category || 'Personal',
      subtasks: data.subtasks || [],
      reminderEnabled: Boolean(data.reminderEnabled && preferences.remindersEnabled),
      reminderNotificationId: undefined,
      createdAt: now,
      updatedAt: now,
    };

    if (initialTask.reminderEnabled) {
      const notifId = await notificationsService.scheduleTaskReminder(initialTask);
      initialTask.reminderNotificationId = notifId;
    }

    await taskRepository.insertTask(initialTask);
    hapticsService.impactLight();
    await refreshTasks();
    return initialTask;
  };

  const updateTask = async (task: Task) => {
    if (task.completed || !task.reminderEnabled) {
      if (task.reminderNotificationId) {
        await notificationsService.cancelReminder(task.reminderNotificationId);
        task.reminderNotificationId = undefined;
      }
    } else if (task.reminderEnabled) {
      if (task.reminderNotificationId) {
        await notificationsService.cancelReminder(task.reminderNotificationId);
      }
      const notifId = await notificationsService.scheduleTaskReminder(task);
      task.reminderNotificationId = notifId;
    }

    await taskRepository.updateTask(task);
    hapticsService.selection();
    await refreshTasks();
  };

  const toggleTask = async (id: string) => {
    const existing = tasks.find((t) => t.id === id);
    if (!existing) return;

    const nextCompleted = !existing.completed;

    if (nextCompleted) {
      hapticsService.success();
      if (existing.reminderNotificationId) {
        await notificationsService.cancelReminder(existing.reminderNotificationId);
      }
    } else {
      hapticsService.selection();
    }

    await taskRepository.toggleTaskCompletion(id, nextCompleted);
    await refreshTasks();

    if (nextCompleted && preferences.celebrationsEnabled) {
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRemaining = tasks.filter(
        (t) => t.id !== id && !t.completed && (t.dueDate === todayStr || !t.dueDate)
      );
      if (todayRemaining.length === 0 && tasks.length > 0) {
        setShowCelebration(true);
      }
    }
  };

  const deleteTask = async (id: string) => {
    const existing = tasks.find((t) => t.id === id);
    if (existing?.reminderNotificationId) {
      await notificationsService.cancelReminder(existing.reminderNotificationId);
    }
    await taskRepository.deleteTask(id);
    hapticsService.impactMedium();
    await refreshTasks();
  };

  const clearCompleted = async (): Promise<number> => {
    const count = await taskRepository.clearCompletedTasks();
    hapticsService.impactMedium();
    await refreshTasks();
    return count;
  };

  const todayProgress: DayProgress = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysTasks = tasks.filter((t) => t.dueDate === todayStr || (!t.dueDate && !t.completed));
    const completedToday = tasks.filter(
      (t) => (t.dueDate === todayStr && t.completed) || (t.completedAt && new Date(t.completedAt).toISOString().split('T')[0] === todayStr)
    );

    const total = Math.max(todaysTasks.length, completedToday.length);
    const completed = completedToday.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percentage };
  }, [tasks]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        refreshTasks,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        clearCompleted,
        stats,
        weeklyActivity,
        todayProgress,
        showCelebration,
        closeCelebration: () => setShowCelebration(false),
        triggerCelebration: () => setShowCelebration(true),
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks(): TaskContextValue {
  return useContext(TaskContext);
}
