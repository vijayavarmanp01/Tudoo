import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BunnyMascot, BunnyMood } from './BunnyMascot';
import { useSettings } from '../context/SettingsContext';

interface EmptyStateProps {
  mood?: BunnyMood;
  title?: string;
  subtitle?: string;
  button?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  mood = 'resting',
  title = 'All caught up!',
  subtitle = 'No tasks for today. Take a moment to relax and enjoy your day! 💜',
  button,
}) => {
  const { colors } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.bunnyWrapper}>
        <BunnyMascot mood={mood} size={140} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      ) : null}
      {button ? <View style={styles.buttonWrapper}>{button}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  bunnyWrapper: {
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 290,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});
