import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSettings } from '../context/SettingsContext';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8 }) => {
  const { isDark } = useSettings();
  const clamped = Math.min(100, Math.max(0, progress));
  const [animatedWidth] = useState(() => new Animated.Value(clamped));

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: clamped,
      bounciness: 4,
      speed: 12,
      useNativeDriver: false,
    }).start();
  }, [clamped, animatedWidth]);

  return (
    <View
      style={[
        styles.track,
        {
          height,
          backgroundColor: isDark ? 'rgba(167, 136, 250, 0.15)' : '#EDE9FE',
          borderRadius: height / 2,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.fillContainer,
          {
            height,
            borderRadius: height / 2,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
          },
        ]}
      >
        <LinearGradient
          colors={['#A788FA', '#F472B6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradientFill, { borderRadius: height / 2 }]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fillContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  gradientFill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
