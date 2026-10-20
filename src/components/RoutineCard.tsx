import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Routine } from '../types/routine';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface RoutineCardProps {
  routine: Routine;
  onToggle: (enabled: boolean) => void;
  onPress?: () => void;
}

const getRoutineIcon = (title: string, category: string): { name: keyof typeof Ionicons.glyphMap; color: string; bg: string } => {
  const t = title.toLowerCase();
  if (t.includes('morning') || t.includes('wake') || t.includes('sun')) {
    return { name: 'sunny', color: '#F59E0B', bg: '#FEF3C7' };
  }
  if (t.includes('workout') || t.includes('gym') || t.includes('exercise') || t.includes('fitness')) {
    return { name: 'barbell', color: '#8B5CF6', bg: '#EDE9FE' };
  }
  if (t.includes('study') || t.includes('read') || t.includes('learn') || t.includes('book')) {
    return { name: 'book', color: '#EC4899', bg: '#FCE7F3' };
  }
  if (t.includes('evening') || t.includes('night') || t.includes('sleep') || t.includes('bed')) {
    return { name: 'moon', color: '#6366F1', bg: '#E0E7FF' };
  }
  if (t.includes('review') || t.includes('plan') || t.includes('week')) {
    return { name: 'calendar', color: '#10B981', bg: '#D1FAE5' };
  }
  return { name: 'sparkles', color: '#A788FA', bg: '#F3EEFF' };
};

export const RoutineCard: React.FC<RoutineCardProps> = ({ routine, onToggle, onPress }) => {
  const { colors, isDark } = useSettings();
  const iconConfig = getRoutineIcon(routine.title, routine.category);

  const handleToggle = (val: boolean) => {
    hapticsService.selection();
    onToggle(val);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={[
        styles.card,
        shadows.card,
        {
          backgroundColor: colors.card,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
          borderWidth: 1,
          opacity: routine.enabled ? 1 : 0.65,
        },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: isDark ? '#26203D' : iconConfig.bg }]}>
        <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {routine.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {routine.description || `${routine.scheduledTime} · Scheduled`}
        </Text>
      </View>

      <Switch
        value={routine.enabled}
        onValueChange={handleToggle}
        trackColor={{
          false: isDark ? '#3D345E' : '#E2D9F3',
          true: colors.primary,
        }}
        thumbColor="#FFFFFF"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: borderRadius.lg,
    marginBottom: 10,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
  },
});
