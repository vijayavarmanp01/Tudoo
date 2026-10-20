export type Priority = 'low' | 'medium' | 'high';

export type Category = 'Personal' | 'Work' | 'Study' | 'Health' | 'Errands' | 'Creative' | 'Shopping' | 'Finance' | 'Other';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  category: Category;
  subtasks: Subtask[];
  reminderEnabled: boolean;
  reminderNotificationId?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number | null;
}

export type TaskStatusFilter = 'all' | 'active' | 'completed';

export type TaskSortBy = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFilterState {
  status: TaskStatusFilter;
  priority?: Priority | 'all';
  category?: Category | 'all';
  searchQuery: string;
  sortBy: TaskSortBy;
  sortAscending: boolean;
}

export interface DayProgress {
  total: number;
  completed: number;
  percentage: number;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Mon, Tue...
  completedCount: number;
  totalCreated: number;
}
