import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types/task';
import { priorityColors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'small' | 'medium';
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = 'sm' }) => {
  const { isDark } = useSettings();
  const config = priorityColors[priority] || priorityColors.medium;
  const bg = isDark ? config.bgDark : config.bgLight;
  const textColor = isDark ? config.textDark : config.textLight;

  const isMedium = size === 'md' || size === 'medium';
  const label = priority.charAt(0).toUpperCase() + priority.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isMedium && styles.badgeMedium]}>
      <View style={[styles.dot, { backgroundColor: textColor }]} />
      <Text style={[styles.text, { color: textColor }, isMedium && styles.textMedium]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textMedium: {
    fontSize: 13,
  },
});
