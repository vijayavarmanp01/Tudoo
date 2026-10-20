import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { hapticsService } from '../services/haptics';

export type TabScreen = 'today' | 'tasks' | 'routines' | 'stats' | 'settings' | 'upcoming' | 'progress';

interface BottomNavProps {
  currentTab: TabScreen;
  onSelectTab: (tab: TabScreen) => void;
  onQuickAdd: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onQuickAdd,
}) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useSettings();

  const handlePress = (tab: TabScreen) => {
    hapticsService.selection();
    onSelectTab(tab);
  };

  // Map legacy tabs if needed
  const normalizedTab =
    currentTab === 'upcoming' ? 'tasks' : currentTab === 'progress' ? 'stats' : currentTab;

  const navItems: {
    tab: TabScreen;
    label: string;
    iconActive: keyof typeof Ionicons.glyphMap;
    iconInactive: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      tab: 'today',
      label: 'Today',
      iconActive: 'calendar',
      iconInactive: 'calendar-outline',
    },
    {
      tab: 'tasks',
      label: 'Tasks',
      iconActive: 'checkbox',
      iconInactive: 'checkbox-outline',
    },
    {
      tab: 'routines',
      label: 'Routines',
      iconActive: 'repeat',
      iconInactive: 'repeat-outline',
    },
    {
      tab: 'stats',
      label: 'Stats',
      iconActive: 'stats-chart',
      iconInactive: 'stats-chart-outline',
    },
    {
      tab: 'settings',
      label: 'Settings',
      iconActive: 'settings',
      iconInactive: 'settings-outline',
    },
  ];

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: Math.max(insets.bottom, 10),
          backgroundColor: isDark ? colors.background : '#FAF8FF',
        },
      ]}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark ? 'rgba(29, 25, 48, 0.96)' : 'rgba(255, 255, 255, 0.96)',
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(167, 136, 250, 0.15)',
            shadowColor: isDark ? '#000000' : '#8B5CF6',
          },
        ]}
      >
        {navItems.map((item) => {
          const isActive = normalizedTab === item.tab;
          return (
            <TouchableOpacity
              key={item.tab}
              onPress={() => handlePress(item.tab)}
              style={[
                styles.tabItem,
                isActive && {
                  backgroundColor: isDark ? 'rgba(167, 136, 250, 0.16)' : 'rgba(139, 92, 246, 0.1)',
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? item.iconActive : item.iconInactive}
                size={20}
                color={isActive ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textSecondary,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 24,
    borderWidth: 1,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    flex: 1,
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});
