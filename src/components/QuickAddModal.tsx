import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Priority, Category, Task } from '../types/task';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';
import { BunnyMascot } from './BunnyMascot';
import { GradientButton } from './GradientButton';
import { hapticsService } from '../services/haptics';

interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task> & { title: string }) => Promise<void>;
  defaultDueDate?: string;
}

const CATEGORIES: { label: Category; icon: string }[] = [
  { label: 'Personal', icon: '💜' },
  { label: 'Work', icon: '💼' },
  { label: 'Study', icon: '📖' },
  { label: 'Health', icon: '🌿' },
  { label: 'Errands', icon: '🛒' },
  { label: 'Creative', icon: '🎨' },
  { label: 'Shopping', icon: '🛍️' },
  { label: 'Finance', icon: '💰' },
  { label: 'Other', icon: '✨' },
];

const PRIORITIES: { label: string; value: Priority; color: string; bg: string }[] = [
  { label: 'High', value: 'high', color: '#E11D48', bg: '#FFE4E6' },
  { label: 'Medium', value: 'medium', color: '#D97706', bg: '#FEF3C7' },
  { label: 'Low', value: 'low', color: '#059669', bg: '#ECFDF5' },
];

const COMMON_TIMES = ['09:00', '12:00', '15:00', '18:00', '21:00'];

const QuickAddContent: React.FC<{
  onClose: () => void;
  onSave: (taskData: Partial<Task> & { title: string }) => Promise<void>;
  defaultDueDate?: string;
}> = ({ onClose, onSave, defaultDueDate }) => {
  const { colors, isDark, preferences } = useSettings();
  const inputRef = useRef<TextInput>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<Category>('Personal');
  const [dueDate, setDueDate] = useState<string | undefined>(
    defaultDueDate || new Date().toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState<string | undefined>(undefined);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const tomorrowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

  const handleSave = async () => {
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        category,
        dueDate,
        dueTime,
        reminderEnabled: reminderEnabled && preferences.remindersEnabled,
      });
      hapticsService.notification('success');
      onClose();
    } catch (err) {
      console.warn('Failed to save task:', err);
    } finally {
      setIsSubmitting(false);
    }
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
        {/* Header with peeking mascot matching Screen 3 */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>
              New Task ✨
            </Text>
            <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
              Plan it out with Tudoo
            </Text>
          </View>

          <View style={styles.mascotWrapper}>
            <BunnyMascot mood="peeking" size={54} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title Input */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Title</Text>
          <TextInput
            ref={inputRef}
            style={[
              styles.inputTitle,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                borderColor: isDark ? '#2E274A' : '#EDE9FE',
              },
            ]}
            placeholder="What do you want to do?"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            returnKeyType="next"
          />

          {/* Description Input */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[
              styles.inputDesc,
              {
                color: colors.textPrimary,
                backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                borderColor: isDark ? '#2E274A' : '#EDE9FE',
              },
            ]}
            placeholder="Add more details (optional)"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />

          {/* Due Date Row */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Due Date</Text>
          <View style={styles.pillsRow}>
            <TouchableOpacity
              onPress={() => {
                hapticsService.selection();
                setDueDate(todayStr);
              }}
              style={[
                styles.pill,
                {
                  backgroundColor: dueDate === todayStr ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                  borderColor: dueDate === todayStr ? colors.primary : isDark ? '#3D345E' : '#DDD6FE',
                },
              ]}
            >
              <Text style={[styles.pillText, { color: dueDate === todayStr ? '#FFFFFF' : colors.textPrimary }]}>
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                hapticsService.selection();
                setDueDate(tomorrowStr);
              }}
              style={[
                styles.pill,
                {
                  backgroundColor: dueDate === tomorrowStr ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                  borderColor: dueDate === tomorrowStr ? colors.primary : isDark ? '#3D345E' : '#DDD6FE',
                },
              ]}
            >
              <Text style={[styles.pillText, { color: dueDate === tomorrowStr ? '#FFFFFF' : colors.textPrimary }]}>
                Tomorrow
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                hapticsService.selection();
                setDueDate(undefined);
              }}
              style={[
                styles.pill,
                {
                  backgroundColor: dueDate === undefined ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                  borderColor: dueDate === undefined ? colors.primary : isDark ? '#3D345E' : '#DDD6FE',
                },
              ]}
            >
              <Text style={[styles.pillText, { color: dueDate === undefined ? '#FFFFFF' : colors.textPrimary }]}>
                No Date
              </Text>
            </TouchableOpacity>
          </View>

          {/* Due Time Row */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextGroup}>
              <Ionicons name="time-outline" size={18} color={colors.primary} />
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Due Time</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowTimePicker(!showTimePicker)}
              style={[
                styles.timeSelectBtn,
                {
                  backgroundColor: dueTime ? colors.primaryLight : isDark ? '#26203D' : '#F3EEFF',
                  borderColor: isDark ? '#3D345E' : '#DDD6FE',
                },
              ]}
            >
              <Text style={[styles.timeSelectText, { color: dueTime ? colors.primary : colors.textSecondary }]}>
                {dueTime || 'Not set >'}
              </Text>
            </TouchableOpacity>
          </View>

          {showTimePicker && (
            <View style={styles.timePresetsRow}>
              {COMMON_TIMES.map((time) => (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    hapticsService.selection();
                    setDueTime(dueTime === time ? undefined : time);
                  }}
                  style={[
                    styles.timePresetChip,
                    {
                      backgroundColor: dueTime === time ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                    },
                  ]}
                >
                  <Text style={[styles.timePresetText, { color: dueTime === time ? '#FFFFFF' : colors.textPrimary }]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Priority */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Priority</Text>
          <View style={styles.pillsRow}>
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.value;
              return (
                <TouchableOpacity
                  key={p.value}
                  onPress={() => {
                    hapticsService.selection();
                    setPriority(p.value);
                  }}
                  style={[
                    styles.pill,
                    {
                      backgroundColor: isSelected ? p.color : isDark ? '#26203D' : p.bg,
                      borderColor: isSelected ? p.color : isDark ? '#3D345E' : '#DDD6FE',
                    },
                  ]}
                >
                  <View style={[styles.priorityDot, { backgroundColor: isSelected ? '#FFFFFF' : p.color }]} />
                  <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : isDark ? '#FFFFFF' : p.color }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Category */}
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((c) => {
              const isSelected = category === c.label;
              return (
                <TouchableOpacity
                  key={c.label}
                  onPress={() => {
                    hapticsService.selection();
                    setCategory(c.label);
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                      borderColor: isSelected ? colors.primary : isDark ? '#3D345E' : '#DDD6FE',
                    },
                  ]}
                >
                  <Text style={{ marginRight: 4, fontSize: 13 }}>{c.icon}</Text>
                  <Text
                    style={[
                      styles.categoryText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Enable Reminder Toggle */}
          <View style={[styles.toggleRow, { marginTop: 14 }]}>
            <View style={styles.toggleTextGroup}>
              <Ionicons name="notifications-outline" size={18} color={colors.primary} />
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Enable Reminder</Text>
            </View>
            <Switch
              value={reminderEnabled}
              onValueChange={(val) => {
                hapticsService.selection();
                setReminderEnabled(val);
              }}
              trackColor={{ false: isDark ? '#3D345E' : '#E2D9F3', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Create Button */}
          <View style={styles.createBtnWrapper}>
            <GradientButton
              title="Create Task"
              onPress={handleSave}
              disabled={!title.trim()}
              loading={isSubmitting}
              icon="add"
              size="lg"
            />
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  visible,
  onClose,
  onSave,
  defaultDueDate,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <QuickAddContent
        onClose={onClose}
        onSave={onSave}
        defaultDueDate={defaultDueDate}
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
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  mascotWrapper: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 6,
  },
  inputTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  inputDesc: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  priorityDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeSelectBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  timeSelectText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  timePresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  timePresetChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.pill,
  },
  timePresetText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createBtnWrapper: {
    marginTop: 22,
  },
});
