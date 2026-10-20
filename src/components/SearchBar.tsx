import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { borderRadius } from '../theme/spacing';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  showFilterToggle?: boolean;
  filtersActive?: boolean;
  onToggleFilters?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  showFilterToggle = true,
  filtersActive = false,
  onToggleFilters,
  placeholder = 'Search tasks...',
}) => {
  const { colors, isDark } = useSettings();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: isDark ? colors.cardElevated : '#FFFFFF',
            borderColor: colors.border,
          },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={styles.icon} />
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {showFilterToggle && onToggleFilters && (
        <TouchableOpacity
          onPress={onToggleFilters}
          style={[
            styles.filterBtn,
            {
              backgroundColor: filtersActive ? colors.primary : colors.card,
              borderColor: filtersActive ? colors.primary : colors.border,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={filtersActive ? '#FFFFFF' : colors.textPrimary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
