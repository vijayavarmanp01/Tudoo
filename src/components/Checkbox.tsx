import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onToggle, size = 26 }) => {
  const { colors, preferences } = useSettings();
  const [scaleAnim] = useState(() => new Animated.Value(checked ? 1 : 0.8));

  useEffect(() => {
    if (preferences.animationsEnabled) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.75,
          duration: 70,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [checked, preferences.animationsEnabled, scaleAnim]);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onToggle}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size / 2, // Circular modern soft check
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : colors.card,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {checked && (
          <Ionicons name="checkmark" size={size * 0.65} color="#FFFFFF" />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
