import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { routineRepository } from '../db/routineRepository';
import { Routine } from '../types/routine';
import { Category } from '../types/task';
import { RoutineCard } from '../components/RoutineCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { GradientButton } from '../components/GradientButton';
import { EmptyState } from '../components/EmptyState';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

type RoutineFilter = 'All' | 'Morning' | 'Evening';

export const RoutinesScreen: React.FC = () => {
  const { colors, isDark } = useSettings();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<RoutineFilter>('All');

  // Add routine modal state
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const newCategory: Category = 'Health';

  const loadRoutines = useCallback(async () => {
    try {
      const data = await routineRepository.getAllRoutines();
      setRoutines(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRoutines();
  }, [loadRoutines]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutines();
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    await routineRepository.toggleRoutine(id, enabled);
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled } : r))
    );
  };

  const handleCreateRoutine = async () => {
    if (!newTitle.trim()) return;
    hapticsService.notification('success');
    await routineRepository.insertRoutine({
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      enabled: true,
      scheduledTime: newTime,
      category: newCategory,
      priority: 'medium',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    });
    setNewTitle('');
    setNewDesc('');
    setAddModalVisible(false);
    await loadRoutines();
  };

  const filteredRoutines = useMemo(() => {
    if (filter === 'All') return routines;
    if (filter === 'Morning') {
      return routines.filter((r) => {
        const hour = parseInt(r.scheduledTime.split(':')[0], 10);
        return hour < 12 || r.title.toLowerCase().includes('morning') || r.title.toLowerCase().includes('wake');
      });
    }
    return routines.filter((r) => {
      const hour = parseInt(r.scheduledTime.split(':')[0], 10);
      return hour >= 17 || r.title.toLowerCase().includes('evening') || r.title.toLowerCase().includes('night');
    });
  }, [routines, filter]);

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
        {/* Header matching Screen 5 */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Routines 🔁</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Build lasting habits day by day
          </Text>
        </View>

        {/* Filter Pills matching Screen 5 */}
        <View style={styles.filterRow}>
          {(['All', 'Morning', 'Evening'] as RoutineFilter[]).map((f) => {
            const isSelected = filter === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  hapticsService.selection();
                  setFilter(f);
                }}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: isSelected ? colors.primary : isDark ? '#26203D' : '#F3EEFF',
                    borderColor: isSelected ? colors.primary : isDark ? '#3D345E' : '#DDD6FE',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: isSelected ? '#FFFFFF' : colors.textPrimary,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Routines List */}
        <View style={styles.routinesList}>
          {filteredRoutines.length === 0 ? (
            <EmptyState
              mood="peaceful"
              title="No routines found"
              subtitle="Tap the + button to create a new routine for your daily productivity."
            />
          ) : (
            filteredRoutines.map((r) => (
              <RoutineCard
                key={r.id}
                routine={r}
                onToggle={(val) => handleToggle(r.id, val)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB (+) to Add Routine */}
      <FloatingActionButton
        onPress={() => setAddModalVisible(true)}
        icon="add"
      />

      {/* Add Routine Modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setAddModalVisible(false)}
          />
          <View
            style={[
              styles.modalSheet,
              shadows.floating,
              {
                backgroundColor: colors.card,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(167, 136, 250, 0.15)',
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                New Routine ✨
              </Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Routine Title</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. Morning Stretch & Water"
              placeholderTextColor={colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. 3 tasks · Daily habit"
              placeholderTextColor={colors.textMuted}
              value={newDesc}
              onChangeText={setNewDesc}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Scheduled Time</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDark ? '#1C182E' : '#F8F6FF',
                  borderColor: colors.border,
                },
              ]}
              placeholder="08:00"
              placeholderTextColor={colors.textMuted}
              value={newTime}
              onChangeText={setNewTime}
            />

            <View style={{ marginTop: 20 }}>
              <GradientButton
                title="Create Routine"
                onPress={handleCreateRoutine}
                disabled={!newTitle.trim()}
                icon="checkmark"
                size="lg"
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
  },
  routinesList: {
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(18, 16, 31, 0.55)',
  },
  modalSheet: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: 22,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 10,
    marginBottom: 6,
  },
  modalInput: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
});
