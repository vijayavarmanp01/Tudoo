import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GradientButton } from './GradientButton';
import { useSettings } from '../context/SettingsContext';
import { borderRadius, shadows } from '../theme/spacing';

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon = 'help-circle-outline',
  onConfirm,
  onCancel,
}) => {
  const { colors, isDark } = useSettings();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View
          style={[
            styles.card,
            shadows.floating,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(167, 136, 250, 0.2)',
            },
          ]}
        >
          <View
            style={[
              styles.iconWrapper,
              {
                backgroundColor:
                  confirmVariant === 'danger'
                    ? isDark ? '#4C1322' : '#FEE2E2'
                    : isDark ? '#2E284D' : '#F3EEFF',
              },
            ]}
          >
            <Ionicons
              name={icon}
              size={28}
              color={confirmVariant === 'danger' ? '#EF4444' : colors.primary}
            />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              onPress={onCancel}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: isDark ? '#26203D' : '#F3EEFF',
                  borderColor: isDark ? '#3D345E' : '#DDD6FE',
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <View style={{ width: 10 }} />

            <View style={{ flex: 1 }}>
              <GradientButton
                title={confirmText}
                onPress={onConfirm}
                variant={confirmVariant}
                size="md"
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 16, 31, 0.55)',
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
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
