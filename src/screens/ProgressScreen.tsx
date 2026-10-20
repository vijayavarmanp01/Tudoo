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
import { ProgressBar } from '../components/ProgressBar';
import { ConfirmationDialog } from '../components/ConfirmationDialog';
import { Task, Category } from '../types/task';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface ProgressScreenProps {
  onOpenTaskDetail?: (task: Task) => void;
}

const CATEGORIES: Category[] = [
  'Personal',
  'Work',
  'Study',
  'Health',
  'Errands',
  'Creative',
  'Shopping',
  'Finance',
  'Other',
];

type Period = 'Week' | 'Month' | 'Year';

export const ProgressScreen: React.FC<ProgressScreenProps> = () => {
  const { colors, isDark } = useSettings();
  const { stats, weeklyActivity, tasks, refreshTasks, clearCompleted } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('Week');
  const [clearDialogVisible, setClearDialogVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const completedTasks = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const catTasks = tasks.filter((t) => t.category === cat);
      const done = catTasks.filter((t) => t.completed).length;
      return {
        category: cat,
        total: catTasks.length,
        completed: done,
        pct: catTasks.length > 0 ? Math.round((done / catTasks.length) * 100) : 0,
      };
    }).filter((c) => c.total > 0);
  }, [tasks]);

  // Overall completion rate
  const totalCount = tasks.length;
  const doneCount = completedTasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  // Max count for weekly bar chart scaling
  const maxBarValue = Math.max(...weeklyActivity.map((d) => d.completedCount), 1);

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
        {/* Header matching Screen 7 */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Your Progress 📊</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Celebrate every milestone you achieve
          </Text>
        </View>

        {/* Period Selector matching Screen 7 (Week, Month, Year) */}
        <View
          style={[
            styles.segmentedControl,
            {
              backgroundColor: isDark ? '#26203D' : '#F3EEFF',
              borderColor: isDark ? '#3D345E' : '#DDD6FE',
            },
          ]}
        >
          {(['Week', 'Month', 'Year'] as Period[]).map((p) => {
            const isSelected = period === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => {
                  hapticsService.selection();
                  setPeriod(p);
                }}
                style={[
                  styles.segmentBtn,
                  isSelected && {
                    backgroundColor: colors.card,
                    ...shadows.soft,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    {
                      color: isSelected ? colors.primary : colors.textSecondary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Big Circular Progress Ring Card matching Screen 7 */}
        <View
          style={[
            styles.progressRingCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.outerCircle,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? '#25203D' : '#FAF8FF',
              },
            ]}
          >
            <Text style={[styles.percentageNumber, { color: colors.textPrimary }]}>
              {completionPercentage}%
            </Text>
            <Text style={[styles.percentageLabel, { color: colors.textSecondary }]}>
              Completed
            </Text>
          </View>

          <Text style={[styles.taskRatioTitle, { color: colors.textPrimary }]}>
            Tasks Completed
          </Text>
          <Text style={[styles.taskRatioSubtitle, { color: colors.textSecondary }]}>
            {doneCount} of {totalCount} total tasks
          </Text>
        </View>

        {/* 7-Day Completion Bar Chart matching Screen 7 */}
        <View
          style={[
            styles.chartCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Weekly Activity
          </Text>
          <View style={styles.barChartContainer}>
            {weeklyActivity.map((day) => {
              const heightPercent = Math.min(100, Math.round((day.completedCount / maxBarValue) * 100));
              const isToday =
                day.date === new Date().toISOString().split('T')[0];

              return (
                <View key={day.date} style={styles.barCol}>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(heightPercent, 10)}%`,
                          backgroundColor: isToday ? colors.primary : colors.accentLavender,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        color: isToday ? colors.primary : colors.textSecondary,
                        fontWeight: isToday ? '700' : '500',
                      },
                    ]}
                  >
                    {day.dayLabel.charAt(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Metric Cards Row matching Screen 7 */}
        <View style={styles.metricsRow}>
          <View
            style={[
              styles.metricCard,
              shadows.card,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="flame" size={24} color="#F59E0B" />
            </View>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              {stats.completedThisWeek || stats.completedToday || 0}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Weekly Streak
            </Text>
          </View>

          <View
            style={[
              styles.metricCard,
              shadows.card,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
              },
            ]}
          >
            <View style={[styles.metricIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="checkmark-done" size={24} color="#10B981" />
            </View>
            <Text style={[styles.metricNumber, { color: colors.textPrimary }]}>
              {stats.totalCompleted}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Total Completed
            </Text>
          </View>
        </View>

        {/* Category Breakdown matching Screen 7 */}
        {categoryStats.length > 0 && (
          <View
            style={[
              styles.categoryCard,
              shadows.card,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 12 }]}>
              Category Breakdown
            </Text>

            {categoryStats.map((item) => (
              <View key={item.category} style={styles.categoryItem}>
                <View style={styles.catLabelRow}>
                  <Text style={[styles.catName, { color: colors.textPrimary }]}>
                    {item.category}
                  </Text>
                  <Text style={[styles.catPercent, { color: colors.textSecondary }]}>
                    {item.pct}% ({item.completed}/{item.total})
                  </Text>
                </View>
                <ProgressBar progress={item.pct} height={7} />
              </View>
            ))}
          </View>
        )}

        {/* Clear Completed Action Button */}
        {doneCount > 0 && (
          <View style={styles.clearBtnWrapper}>
            <TouchableOpacity
              onPress={() => setClearDialogVisible(true)}
              style={[
                styles.clearBtn,
                {
                  backgroundColor: isDark ? '#2D1B22' : '#FEE2E2',
                  borderColor: isDark ? '#4A1D23' : '#FECDD3',
                },
              ]}
            >
              <Ionicons name="trash-outline" size={16} color={colors.dangerText} />
              <Text style={[styles.clearBtnText, { color: colors.dangerText }]}>
                Clear {doneCount} Completed Tasks
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        visible={clearDialogVisible}
        title="Clear Completed Tasks"
        message={`Are you sure you want to remove all ${doneCount} completed tasks? Active tasks will remain untouched.`}
        confirmText="Clear All"
        confirmVariant="danger"
        icon="trash"
        onConfirm={async () => {
          setClearDialogVisible(false);
          await clearCompleted();
          hapticsService.notification('success');
        }}
        onCancel={() => setClearDialogVisible(false)}
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.pill,
    padding: 3,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
  },
  progressRingCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  percentageNumber: {
    fontSize: 28,
    fontWeight: '800',
  },
  percentageLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  taskRatioTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskRatioSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  chartCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 18,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginTop: 14,
    paddingHorizontal: 8,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: 'rgba(167, 136, 250, 0.1)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: 14,
    borderRadius: 7,
  },
  barLabel: {
    fontSize: 12,
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  metricIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricNumber: {
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  categoryCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 18,
    borderWidth: 1,
  },
  categoryItem: {
    marginBottom: 12,
  },
  catLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '600',
  },
  catPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  clearBtnWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    gap: 6,
  },
  clearBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
});
