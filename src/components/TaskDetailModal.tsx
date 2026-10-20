import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Subtask } from '../types/task';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';
import { PriorityBadge } from './PriorityBadge';
import { CategoryBadge } from './CategoryBadge';
import { Checkbox } from './Checkbox';
import { GradientButton } from './GradientButton';
import { hapticsService } from '../services/haptics';

interface TaskDetailModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string) => Promise<void>;
}

const TaskDetailContent: React.FC<{
  task: Task;
  onClose: () => void;
  onSave: (updatedTask: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string) => Promise<void>;
}> = ({ task, onClose, onSave, onDelete, onToggleComplete }) => {
  const { colors, isDark } = useSettings();

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const priority = task.priority;
  const category = task.category;
  const dueDate = task.dueDate;
  const [dueTime] = useState<string | undefined>(task.dueTime);
  const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    hapticsService.impactLight();
    const newSubtask: Subtask = {
      id: 'sub_' + Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const next = [...subtasks, newSubtask];
    setSubtasks(next);
    setNewSubtaskTitle('');
    onSave({ ...task, subtasks: next });
  };

  const handleToggleSubtask = (id: string) => {
    hapticsService.selection();
    const next = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(next);
    onSave({ ...task, subtasks: next });
  };

  const handleRemoveSubtask = (id: string) => {
    hapticsService.impactLight();
    const next = subtasks.filter((s) => s.id !== id);
    setSubtasks(next);
    onSave({ ...task, subtasks: next });
  };

  const handleSaveEdit = async () => {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const updated: Task = {
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate,
        dueTime,
        subtasks,
        updatedAt: Date.now(),
      };
      await onSave(updated);
      setIsEditing(false);
      hapticsService.notification('success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    hapticsService.notification('warning');
    Alert.alert(
      'Delete Task',
      `Permanently remove "${task.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await onDelete(task.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.overlay}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <View
        style={[
          styles.sheet,
          shadows.floating,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(167, 136, 250, 0.15)',
          },
        ]}
      >
        {/* Top Action Bar matching Screen 4 */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              onPress={() => setIsEditing(!isEditing)}
              style={styles.iconBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isEditing ? 'checkmark' : 'pencil'}
                size={20}
                color={isEditing ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.iconBtn, { marginLeft: 8 }]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.dangerText} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Title Row with circular check */}
          <View style={styles.titleRow}>
            <Checkbox
              checked={task.completed}
              onToggle={() => onToggleComplete(task.id)}
              size={28}
            />

            <View style={styles.titleWrapper}>
              {isEditing ? (
                <TextInput
                  style={[
                    styles.editTitleInput,
                    {
                      color: colors.textPrimary,
                      backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                      borderColor: colors.border,
                    },
                  ]}
                  value={title}
                  onChangeText={setTitle}
                />
              ) : (
                <Text
                  style={[
                    styles.titleText,
                    {
                      color: task.completed ? colors.textMuted : colors.textPrimary,
                      textDecorationLine: task.completed ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {task.title}
                </Text>
              )}
            </View>
          </View>

          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <PriorityBadge priority={task.priority} size="md" />
            <CategoryBadge category={task.category} size="md" />
          </View>

          {/* Due Info */}
          {(task.dueDate || task.dueTime) && (
            <View style={[styles.dueInfoCard, { backgroundColor: isDark ? '#26203D' : '#F3EEFF' }]}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.dueInfoText, { color: colors.primary }]}>
                {task.dueDate ? `Due ${task.dueDate}` : ''}
                {task.dueTime ? ` at ${task.dueTime}` : ''}
              </Text>
            </View>
          )}

          {/* Description / Notes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Notes</Text>
            {isEditing ? (
              <TextInput
                style={[
                  styles.editDescInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                    borderColor: colors.border,
                  },
                ]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Add notes..."
                placeholderTextColor={colors.textMuted}
              />
            ) : (
              <Text style={[styles.descText, { color: description ? colors.textPrimary : colors.textMuted }]}>
                {description || 'No additional notes provided.'}
              </Text>
            )}
          </View>

          {/* Subtasks Section */}
          <View style={styles.section}>
            <View style={styles.subtaskHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Subtasks ({completedSubtasks}/{subtasks.length})
              </Text>
            </View>

            {subtasks.map((s) => (
              <View
                key={s.id}
                style={[
                  styles.subtaskItem,
                  { backgroundColor: isDark ? '#221D38' : '#FAF8FF', borderColor: colors.border },
                ]}
              >
                <TouchableOpacity
                  onPress={() => handleToggleSubtask(s.id)}
                  style={styles.subtaskCheckRow}
                >
                  <Ionicons
                    name={s.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={s.completed ? colors.primary : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.subtaskTitle,
                      {
                        color: s.completed ? colors.textMuted : colors.textPrimary,
                        textDecorationLine: s.completed ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {s.title}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRemoveSubtask(s.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Subtask Input */}
            <View style={styles.addSubtaskRow}>
              <TextInput
                style={[
                  styles.subtaskInput,
                  {
                    color: colors.textPrimary,
                    backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Add a new subtask..."
                placeholderTextColor={colors.textMuted}
                value={newSubtaskTitle}
                onChangeText={setNewSubtaskTitle}
                onSubmitEditing={handleAddSubtask}
              />
              <TouchableOpacity
                onPress={handleAddSubtask}
                style={[styles.addSubtaskBtn, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomBtnWrapper}>
            {isEditing ? (
              <GradientButton
                title="Save Changes"
                onPress={handleSaveEdit}
                loading={isSaving}
                icon="checkmark"
                size="lg"
              />
            ) : (
              <GradientButton
                title={task.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                onPress={() => onToggleComplete(task.id)}
                icon={task.completed ? 'arrow-undo' : 'checkmark-done'}
                size="lg"
              />
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  visible,
  task,
  onClose,
  onSave,
  onDelete,
  onToggleComplete,
}) => {
  if (!visible || !task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TaskDetailContent
        task={task}
        onClose={onClose}
        onSave={onSave}
        onDelete={onDelete}
        onToggleComplete={onToggleComplete}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 16, 31, 0.55)',
  },
  sheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconBtn: {
    padding: 6,
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWrapper: {
    flex: 1,
    marginLeft: 14,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  editTitleInput: {
    fontSize: 18,
    fontWeight: '700',
    padding: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  dueInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 6,
    marginBottom: 16,
  },
  dueInfoText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  },
  editDescInput: {
    fontSize: 14,
    padding: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 60,
  },
  subtaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  subtaskCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  subtaskTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  addSubtaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  subtaskInput: {
    flex: 1,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  addSubtaskBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBtnWrapper: {
    marginTop: 16,
  },
});
