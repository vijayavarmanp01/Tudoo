/* eslint-disable @typescript-eslint/no-require-imports */
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';
import { Task } from '../types/task';

type NotificationsType = typeof import('expo-notifications');
let notificationsModule: NotificationsType | null = null;
let handlerConfigured = false;

function getNotifications(): NotificationsType | null {
  if (isRunningInExpoGo() || Platform.OS === 'web') {
    return null;
  }

  if (!notificationsModule) {
    try {
      notificationsModule = require('expo-notifications');
      if (notificationsModule && !handlerConfigured) {
        notificationsModule.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });
        handlerConfigured = true;
      }
    } catch (err) {
      console.warn('Could not load expo-notifications:', err);
      notificationsModule = null;
    }
  }

  return notificationsModule;
}

export const notificationsService = {
  isSupported(): boolean {
    return !isRunningInExpoGo() && Platform.OS !== 'web';
  },

  async init(): Promise<void> {
    const Notifications = getNotifications();
    if (!Notifications) return;

    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('tudoo-reminders', {
          name: 'Task Reminders',
          description: 'Gentle reminders for scheduled tasks',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#7357C8',
        });
      } catch (err) {
        console.warn('Failed to configure Android notification channels:', err);
      }
    }
  },

  async getPermissionStatus(): Promise<{ status: string; canSchedule: boolean }> {
    if (isRunningInExpoGo()) {
      return { status: 'Expo Go (Available via Development Build)', canSchedule: false };
    }
    if (Platform.OS === 'web') {
      return { status: 'Unsupported platform', canSchedule: false };
    }

    const Notifications = getNotifications();
    if (!Notifications) {
      return { status: 'Unsupported platform', canSchedule: false };
    }

    try {
      const { status } = await Notifications.getPermissionsAsync();
      return { status, canSchedule: status === 'granted' };
    } catch {
      return { status: 'unknown', canSchedule: false };
    }
  },

  async requestPermissions(): Promise<boolean> {
    const Notifications = getNotifications();
    if (!Notifications) return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  },

  async scheduleTaskReminder(task: Task): Promise<string | undefined> {
    if (!task.dueDate || !task.reminderEnabled || task.completed) {
      return undefined;
    }

    const Notifications = getNotifications();
    if (!Notifications) return undefined;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return undefined;

      const [year, month, day] = task.dueDate.split('-').map(Number);
      let hours = 9;
      let minutes = 0;

      if (task.dueTime) {
        const [h, m] = task.dueTime.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          hours = h;
          minutes = m;
        }
      }

      const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0);
      if (scheduledDate.getTime() <= Date.now()) return undefined;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Tudoo Reminder ✨',
          body: task.title,
          data: { taskId: task.id },
          sound: true,
          badge: 1,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledDate,
          channelId: 'tudoo-reminders',
        },
      });

      return id;
    } catch (err) {
      console.warn('Failed to schedule reminder:', err);
      return undefined;
    }
  },

  async cancelReminder(notificationId?: string): Promise<void> {
    if (!notificationId) return;

    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // Ignore
    }
  },
};
