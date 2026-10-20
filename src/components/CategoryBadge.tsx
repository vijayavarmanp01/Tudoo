import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '../types/task';
import { categoryColors } from '../theme/colors';
import { useSettings } from '../context/SettingsContext';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md' | 'small' | 'medium';
}

const categoryIcons: Record<string, string> = {
  Personal: '💜',
  Work: '💼',
  Study: '📖',
  Health: '🌿',
  Errands: '🛒',
  Creative: '🎨',
  Shopping: '🛍️',
  Finance: '💰',
  Other: '✨',
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'sm' }) => {
  const { isDark } = useSettings();
  const config = categoryColors[category] || categoryColors.Personal;
  const bg = isDark ? config.bgDark : config.bgLight;
  const textColor = isDark ? config.textDark : config.textLight;
  const icon = categoryIcons[category] || '📌';

  const isMedium = size === 'md' || size === 'medium';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isMedium && styles.badgeMedium]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.text, { color: textColor }, isMedium && styles.textMedium]}>
        {category}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  icon: {
    fontSize: 10,
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textMedium: {
    fontSize: 13,
  },
});
