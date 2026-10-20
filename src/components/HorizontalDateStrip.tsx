import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface HorizontalDateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  daysRange?: number; // default +/- 7 days
}

interface DateItem {
  dateStr: string;
  dayNumber: number;
  weekday: string;
  isToday: boolean;
}

export const HorizontalDateStrip: React.FC<HorizontalDateStripProps> = ({
  selectedDate,
  onSelectDate,
  daysRange = 6,
}) => {
  const { colors, isDark } = useSettings();

  const dates = React.useMemo(() => {
    const list: DateItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Generate from -1 day to +daysRange days
    for (let i = -1; i <= daysRange; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayNumber = d.getDate();
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
      list.push({
        dateStr,
        dayNumber,
        weekday,
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }, [daysRange]);

  const handleSelect = (d: string) => {
    hapticsService.selection();
    onSelectDate(d);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dates.map((item) => {
          const isSelected = item.dateStr === selectedDate;
          return (
            <TouchableOpacity
              key={item.dateStr}
              activeOpacity={0.8}
              onPress={() => handleSelect(item.dateStr)}
              style={[
                styles.item,
                {
                  backgroundColor: isSelected
                    ? colors.primary
                    : isDark
                    ? '#1E1933'
                    : '#FFFFFF',
                  borderColor: isSelected
                    ? colors.primary
                    : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : colors.border,
                },
                isSelected && shadows.soft,
              ]}
            >
              <Text
                style={[
                  styles.weekday,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : item.isToday
                      ? colors.primary
                      : colors.textSecondary,
                  },
                ]}
              >
                {item.weekday}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  {
                    color: isSelected
                      ? '#FFFFFF'
                      : item.isToday
                      ? colors.primary
                      : colors.textPrimary,
                  },
                ]}
              >
                {item.dayNumber}
              </Text>
              {item.isToday && !isSelected && (
                <View style={[styles.todayDot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  item: {
    width: 52,
    height: 64,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  weekday: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '800',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});
