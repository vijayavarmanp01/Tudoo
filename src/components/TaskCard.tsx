import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../types/task';
import { useSettings } from '../context/SettingsContext';
import { Checkbox } from './Checkbox';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { borderRadius, shadows } from '../theme/spacing';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onPress, onDelete }) => {
  const { colors, isDark } = useSettings();

  const isOverdue = useMemo(() => {
    if (!task.dueDate || task.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return task.dueDate < today;
  }, [task.dueDate, task.completed]);

  const formattedDueDate = useMemo(() => {
    if (!task.dueDate && !task.dueTime) return null;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split('T')[0];

    let datePart = '';
    if (task.dueDate === today) {
      datePart = 'Today';
    } else if (task.dueDate === tomorrow) {
      datePart = 'Tomorrow';
    } else if (task.dueDate) {
      const parts = task.dueDate.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    if (task.dueTime) {
      return datePart ? `${datePart}, ${task.dueTime}` : task.dueTime;
    }
    return datePart;
  }, [task.dueDate, task.dueTime]);

  const subtasksCount = task.subtasks.length;
  const completedSubtasksCount = task.subtasks.filter((s) => s.completed).length;

  const confirmDelete = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      onLongPress={confirmDelete}
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.card,
          borderColor: isOverdue
            ? isDark ? '#5A1B28' : '#FCA5A5'
            : isDark ? 'rgba(255,255,255,0.06)' : colors.border,
          borderWidth: 1,
          opacity: task.completed ? 0.65 : 1,
        },
      ]}
    >
      <View style={styles.cardContent}>
        {/* Checkbox */}
        <Checkbox checked={task.completed} onToggle={onToggle} size={24} />

        {/* Center content */}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              {
                color: task.completed ? colors.textMuted : colors.textPrimary,
                textDecorationLine: task.completed ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={1}
          >
            {task.title}
          </Text>

          {/* Sub row with Time, Category, and Badges */}
          <View style={styles.subRow}>
            {formattedDueDate && (
              <View style={styles.metaItem}>
                <Ionicons
                  name={isOverdue ? 'alert-circle' : 'time-outline'}
                  size={12}
                  color={isOverdue ? colors.dangerText : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: isOverdue ? colors.dangerText : colors.textSecondary },
                  ]}
                >
                  {formattedDueDate}
                </Text>
              </View>
            )}

            {formattedDueDate && <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>}

            <CategoryBadge category={task.category} size="sm" />

            {task.priority !== 'medium' && (
              <>
                <Text style={[styles.dot, { color: colors.textMuted }]}>•</Text>
                <PriorityBadge priority={task.priority} size="sm" />
              </>
            )}

            {subtasksCount > 0 && (
              <View style={[styles.subtaskPill, { backgroundColor: isDark ? '#2B2544' : '#F3EEFF' }]}>
                <Ionicons name="checkbox-outline" size={11} color={colors.primary} />
                <Text style={[styles.subtaskText, { color: colors.primary }]}>
                  {completedSubtasksCount}/{subtasksCount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Right chevron indicator */}
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.textMuted}
          style={styles.chevron}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dot: {
    fontSize: 12,
  },
  subtaskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    gap: 3,
  },
  subtaskText: {
    fontSize: 11,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 4,
  },
});
