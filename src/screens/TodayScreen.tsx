import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../context/TaskContext';
import { useSettings } from '../context/SettingsContext';
import { TaskCard } from '../components/TaskCard';
import { ProgressBar } from '../components/ProgressBar';
import { BunnyMascot } from '../components/BunnyMascot';
import { EmptyState } from '../components/EmptyState';
import { HorizontalDateStrip } from '../components/HorizontalDateStrip';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { Task } from '../types/task';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface TodayScreenProps {
  onOpenQuickAdd: (defaultDate?: string) => void;
  onOpenTaskDetail: (task: Task) => void;
}

type StatusFilter = 'all' | 'active' | 'completed';

export const TodayScreen: React.FC<TodayScreenProps> = ({
  onOpenQuickAdd,
  onOpenTaskDetail,
}) => {
  const { colors, isDark } = useSettings();
  const { tasks, refreshTasks, toggleTask, deleteTask, todayProgress } = useTasks();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Time of day greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 18) return 'Good Afternoon!';
    return 'Good Evening!';
  }, []);

  // Greeting subtitle
  const greetingSub = useMemo(() => {
    if (todayProgress.percentage === 100 && todayProgress.total > 0) {
      return 'All tasks done! Wonderful job today ✨';
    }
    return 'Ready for a productive day?';
  }, [todayProgress]);

  // Tasks filtered for the selected day or search
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        // Date match: if selected date is today, include today's tasks or overdue active tasks or tasks without date
        if (selectedDate === todayStr) {
          const isForToday =
            t.dueDate === todayStr ||
            (!t.dueDate && !t.completed) ||
            (t.dueDate && t.dueDate < todayStr && !t.completed);
          if (!isForToday) return false;
        } else {
          // Specific selected date
          if (t.dueDate !== selectedDate) return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = t.title.toLowerCase().includes(q);
          const matchDesc = t.description?.toLowerCase().includes(q) ?? false;
          if (!matchTitle && !matchDesc) return false;
        }

        // Status filter
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;

        return true;
      })
      .sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const prioMap = { high: 1, medium: 2, low: 3 };
        const diff = prioMap[a.priority] - prioMap[b.priority];
        if (diff !== 0) return diff;
        return b.createdAt - a.createdAt;
      });
  }, [tasks, selectedDate, todayStr, searchQuery, statusFilter]);

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
        {/* Top Header matching Screen 2 */}
        <View style={styles.header}>
          <View style={styles.mascotGreetingRow}>
            <View style={styles.avatarBorder}>
              <BunnyMascot mood="holding_heart" size={50} />
            </View>
            <View style={styles.greetingTextCol}>
              <Text style={[styles.greetingTitle, { color: colors.textPrimary }]}>{greeting}</Text>
              <Text style={[styles.greetingSub, { color: colors.textSecondary }]}>{greetingSub}</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => {
              hapticsService.selection();
              setShowSearch(!showSearch);
            }}
            style={[
              styles.headerActionBtn,
              {
                backgroundColor: showSearch ? colors.primaryLight : isDark ? '#26203D' : '#F3EEFF',
                borderColor: isDark ? '#3D345E' : '#EDE9FE',
              },
            ]}
          >
            <Ionicons
              name={showSearch ? 'close' : 'search-outline'}
              size={18}
              color={showSearch ? colors.primary : colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar if toggled */}
        {showSearch && (
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: isDark ? '#1C182E' : '#FFFFFF',
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search today's tasks..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Horizontal Date Strip matching Screen 2 */}
        <HorizontalDateStrip
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        {/* Today's Tasks Progress Card matching Screen 2 */}
        <View
          style={[
            styles.progressCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
            },
          ]}
        >
          <View style={styles.progressHeaderRow}>
            <View>
              <Text style={[styles.progressCardTitle, { color: colors.textPrimary }]}>
                {"Today's Tasks"}
              </Text>
              <Text style={[styles.progressCardSubtitle, { color: colors.textSecondary }]}>
                {todayProgress.completed} of {todayProgress.total} completed
              </Text>
            </View>

            {/* Quick Status Filter toggle */}
            <View style={styles.statusPills}>
              {(['all', 'active', 'completed'] as StatusFilter[]).map((st) => (
                <TouchableOpacity
                  key={st}
                  onPress={() => {
                    hapticsService.selection();
                    setStatusFilter(st);
                  }}
                  style={[
                    styles.miniStatusPill,
                    statusFilter === st && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.miniStatusText,
                      {
                        color: statusFilter === st ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: statusFilter === st ? '700' : '500',
                      },
                    ]}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.progressBarWrapper}>
            <ProgressBar progress={todayProgress.percentage} height={8} />
          </View>
        </View>

        {/* Task List */}
        <View style={styles.tasksContainer}>
          {filteredTasks.length === 0 ? (
            <EmptyState
              mood="resting"
              title="All caught up!"
              subtitle={
                searchQuery
                  ? 'No tasks matched your search query.'
                  : 'No tasks for today. Take a moment to relax and enjoy your day! 💜'
              }
            />
          ) : (
            filteredTasks.map((t) => (
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

      {/* Floating Action Button (+) matching Screen 2 */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  mascotGreetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarBorder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingTextCol: {
    justifyContent: 'center',
  },
  greetingTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  headerActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 2,
  },
  progressCard: {
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: borderRadius.xl,
    padding: 16,
    borderWidth: 1,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  progressCardSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
  statusPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(167, 136, 250, 0.1)',
    borderRadius: borderRadius.pill,
    padding: 3,
    gap: 2,
  },
  miniStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
  },
  miniStatusText: {
    fontSize: 11,
  },
  progressBarWrapper: {
    marginTop: 2,
  },
  tasksContainer: {
    paddingHorizontal: 20,
  },
});
