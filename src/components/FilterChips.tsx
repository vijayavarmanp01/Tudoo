import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TaskFilterState, Priority, Category, TaskStatusFilter, TaskSortBy } from '../types/task';
import { useSettings } from '../context/SettingsContext';
import { borderRadius } from '../theme/spacing';

interface FilterChipsProps {
  filters: TaskFilterState;
  onChangeFilters: (updated: Partial<TaskFilterState>) => void;
  categories: Category[];
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  onChangeFilters,
  categories,
}) => {
  const { colors } = useSettings();

  const statuses: { label: string; value: TaskStatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Completed', value: 'completed' },
  ];

  const priorities: { label: string; value: Priority | 'all' }[] = [
    { label: 'All Priorities', value: 'all' },
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const sortOptions: { label: string; value: TaskSortBy }[] = [
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Priority', value: 'priority' },
    { label: 'Created', value: 'createdAt' },
    { label: 'Title', value: 'title' },
  ];

  return (
    <View style={styles.container}>
      {/* Status chips */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {statuses.map((s) => {
            const isSelected = filters.status === s.value;
            return (
              <TouchableOpacity
                key={s.value}
                onPress={() => onChangeFilters({ status: s.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chipBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Priority chips */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Priority:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {priorities.map((p) => {
            const isSelected = (filters.priority || 'all') === p.value;
            return (
              <TouchableOpacity
                key={p.value}
                onPress={() => onChangeFilters({ priority: p.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chipBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Category chips */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <TouchableOpacity
            onPress={() => onChangeFilters({ category: 'all' })}
            style={[
              styles.chip,
              {
                backgroundColor: (filters.category || 'all') === 'all' ? colors.primary : colors.chipBackground,
                borderColor: (filters.category || 'all') === 'all' ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                { color: (filters.category || 'all') === 'all' ? '#FFFFFF' : colors.textPrimary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {categories.map((c) => {
            const isSelected = filters.category === c;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => onChangeFilters({ category: c })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chipBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Sort chips */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sort by:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {sortOptions.map((opt) => {
            const isSelected = filters.sortBy === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => onChangeFilters({ sortBy: opt.value })}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.chipBackground,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    marginBottom: 12,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 65,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
