import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { TaskProvider, useTasks } from './src/context/TaskContext';
import { BottomNav, TabScreen } from './src/components/BottomNav';
import { TodayScreen } from './src/screens/TodayScreen';
import { UpcomingScreen } from './src/screens/UpcomingScreen';
import { RoutinesScreen } from './src/screens/RoutinesScreen';
import { ProgressScreen } from './src/screens/ProgressScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { QuickAddModal } from './src/components/QuickAddModal';
import { TaskDetailModal } from './src/components/TaskDetailModal';
import { CelebrationModal } from './src/components/CelebrationModal';
import { BunnyMascot } from './src/components/BunnyMascot';
import { Task } from './src/types/task';

function MainApp() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useSettings();
  const {
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    showCelebration,
    closeCelebration,
  } = useTasks();

  const [currentTab, setCurrentTab] = useState<TabScreen>('today');
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  const [quickAddDefaultDate, setQuickAddDefaultDate] = useState<string | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleOpenQuickAdd = (defaultDate?: string) => {
    setQuickAddDefaultDate(defaultDate);
    setQuickAddVisible(true);
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
  };

  // Splash state matching Screen 1 while DB initializes
  if (loading) {
    return (
      <View
        style={[
          styles.splashContainer,
          { backgroundColor: isDark ? '#12101F' : '#FAF8FF' },
        ]}
      >
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <BunnyMascot mood="holding_heart" size={140} />
        <Text style={[styles.splashTitle, { color: colors.primary }]}>Tudoo</Text>
        <Text style={[styles.splashSubtitle, { color: colors.textSecondary }]}>
          Your Everyday Companion{'\n'}for a More Productive You
        </Text>
        <View style={styles.splashLoadingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.splashLoadingText, { color: colors.textMuted }]}>
            Loading your world...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View style={styles.content}>
        {currentTab === 'today' && (
          <TodayScreen
            onOpenQuickAdd={handleOpenQuickAdd}
            onOpenTaskDetail={handleOpenTaskDetail}
          />
        )}
        {(currentTab === 'tasks' || currentTab === 'upcoming') && (
          <UpcomingScreen
            onOpenQuickAdd={handleOpenQuickAdd}
            onOpenTaskDetail={handleOpenTaskDetail}
          />
        )}
        {currentTab === 'routines' && <RoutinesScreen />}
        {(currentTab === 'stats' || currentTab === 'progress') && (
          <ProgressScreen onOpenTaskDetail={handleOpenTaskDetail} />
        )}
        {currentTab === 'settings' && <SettingsScreen />}
      </View>

      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onQuickAdd={() => handleOpenQuickAdd()}
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        visible={quickAddVisible}
        onClose={() => setQuickAddVisible(false)}
        onSave={async (data) => {
          await addTask(data);
        }}
        defaultDueDate={quickAddDefaultDate}
      />

      {/* Task Details Modal */}
      <TaskDetailModal
        visible={selectedTask !== null}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSave={async (updated) => {
          await updateTask(updated);
        }}
        onDelete={async (id) => {
          await deleteTask(id);
        }}
        onToggleComplete={async (id) => {
          await toggleTask(id);
          if (selectedTask && selectedTask.id === id) {
            setSelectedTask({ ...selectedTask, completed: !selectedTask.completed });
          }
        }}
      />

      {/* Celebration Modal */}
      <CelebrationModal
        visible={showCelebration}
        onClose={closeCelebration}
        title="Great Job! 🎉"
        message="All your tasks for today are completed! Take a moment to celebrate your wonderful progress."
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <TaskProvider>
          <MainApp />
        </TaskProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  splashTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 20,
  },
  splashSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },
  splashLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 36,
  },
  splashLoadingText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
