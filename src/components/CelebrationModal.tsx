import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BunnyMascot } from './BunnyMascot';
import { GradientButton } from './GradientButton';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title = 'Great Job! 🎉',
  message = 'Task completed! Every step forward brings you closer to your goals.',
}) => {
  const { colors, isDark } = useSettings();

  useEffect(() => {
    if (visible) {
      hapticsService.notification('success');
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.card,
            shadows.floating,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(167, 136, 250, 0.2)',
            },
          ]}
        >
          <View style={styles.bunnyContainer}>
            <BunnyMascot mood="celebrating" size={135} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonWrapper}>
            <GradientButton
              title="Yay! Continue 💜"
              onPress={onClose}
              size="md"
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 31, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: borderRadius.xxl,
    paddingVertical: 28,
    paddingHorizontal: 22,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  bunnyContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 22,
  },
  buttonWrapper: {
    width: '100%',
  },
});
