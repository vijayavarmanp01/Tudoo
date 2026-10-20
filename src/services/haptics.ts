import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

class HapticsService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async selection() {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Haptics unavailable on device/simulator
    }
  }

  async impact(style: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      const map = {
        light: Haptics.ImpactFeedbackStyle.Light,
        medium: Haptics.ImpactFeedbackStyle.Medium,
        heavy: Haptics.ImpactFeedbackStyle.Heavy,
      };
      await Haptics.impactAsync(map[style]);
    } catch {
      // Ignore
    }
  }

  async impactLight() {
    return this.impact('light');
  }

  async impactMedium() {
    return this.impact('medium');
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!this.enabled || Platform.OS === 'web') return;
    try {
      const map = {
        success: Haptics.NotificationFeedbackType.Success,
        warning: Haptics.NotificationFeedbackType.Warning,
        error: Haptics.NotificationFeedbackType.Error,
      };
      await Haptics.notificationAsync(map[type]);
    } catch {
      // Ignore
    }
  }

  async success() {
    return this.notification('success');
  }
}

export const hapticsService = new HapticsService();
