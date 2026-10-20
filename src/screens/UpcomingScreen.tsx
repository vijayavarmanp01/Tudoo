import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { Task } from '../types/task';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface UpcomingScreenProps {
  onOpenQuickAdd: (defaultDate?: string) => void;
  onOpenTaskDetail: (task: Task) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const UpcomingScreen: React.FC<UpcomingScreenProps> = ({
  onOpenQuickAdd,
  onOpenTaskDetail,
}) => {
  const { colors, isDark } = useSettings();
  const { tasks, refreshTasks, toggleTask, deleteTask } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const now = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(() => now.toISOString().split('T')[0]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const monthLabel = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    hapticsService.selection();
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    hapticsService.selection();
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Build calendar days matrix
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];

    // Empty padding for previous month
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({ day: 0, dateStr: '', isCurrentMonth: false });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, '0');
      const dayStr = String(d).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
      cells.push({ day: d, dateStr, isCurrentMonth: true });
    }

    return cells;
  }, [currentYear, currentMonth]);

  // Set of dates with tasks
  const taskDatesSet = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => {
      if (t.dueDate) set.add(t.dueDate);
    });
    return set;
  }, [tasks]);

  // Tasks for selected date
  const dayTasks = useMemo(() => {
    return tasks.filter((t) => t.dueDate === selectedDate);
  }, [tasks, selectedDate]);

  const selectedDateLabel = useMemo(() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
    }
    return selectedDate;
  }, [selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Month Selector matching Screen 6 */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navArrow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </TouchableOpacity>

          <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>{monthLabel}</Text>

          <TouchableOpacity onPress={handleNextMonth} style={styles.navArrow} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Calendar Card */}
        <View
          style={[
            styles.calendarCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
            },
          ]}
        >
          {/* Weekday headers */}
          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.weekdayHeader, { color: colors.textSecondary }]}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.grid}>
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return <View key={'empty_' + idx} style={styles.dayCell} />;
              }

              const isSelected = cell.dateStr === selectedDate;
              const hasTasks = taskDatesSet.has(cell.dateStr);

              return (
                <TouchableOpacity
                  key={cell.dateStr}
                  activeOpacity={0.7}
                  onPress={() => {
                    hapticsService.selection();
                    setSelectedDate(cell.dateStr);
                  }}
                  style={styles.dayCell}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      isSelected && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayNumber,
                        {
                          color: isSelected
                            ? '#FFFFFF'
                            : colors.textPrimary,
                          fontWeight: isSelected ? '800' : '500',
                        },
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>

                  {/* Task indicator dot */}
                  {hasTasks && (
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.secondary,
                        },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tasks Section for Selected Date */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Tasks for {selectedDateLabel}
            </Text>
            <Text style={[styles.taskCountBadge, { color: colors.primary }]}>
              {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
            </Text>
          </View>

          {dayTasks.length === 0 ? (
            <EmptyState
              mood="resting"
              title="Nothing planned yet"
              subtitle={`Enjoy a free day or tap the + button to add a task for ${selectedDateLabel}.`}
            />
          ) : (
            dayTasks.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={() => toggleTask(t.id)}
                onPress={() => onOpenTaskDetail(t)}
                onDelete={() => deleteTask(t.id)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB (+) */}
      <FloatingActionButton
        onPress={() => onOpenQuickAdd(selectedDate)}
        icon="add"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  navArrow: {
    padding: 6,
  },
  calendarCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekdayHeader: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  tasksSection: {
    paddingHorizontal: 20,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  taskCountBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
});
