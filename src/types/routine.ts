import { Priority, Category } from './task';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  enabled: boolean;
  scheduledTime: string; // HH:mm
  deadlineTime?: string;
  category: Category;
  priority: Priority;
  daysOfWeek: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  createdAt: number;
  updatedAt: number;
}
