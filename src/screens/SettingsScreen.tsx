import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../context/SettingsContext';
import { useTasks } from '../context/TaskContext';
import { notificationsService } from '../services/notifications';
import { BunnyMascot } from '../components/BunnyMascot';
import { GradientButton } from '../components/GradientButton';
import { ThemeMode } from '../types/theme';
import { Category } from '../types/task';
import { categoryMeta } from '../theme/colors';
import { borderRadius, shadows } from '../theme/spacing';
import { hapticsService } from '../services/haptics';

const CATEGORY_LIST: Category[] = [
  'Personal',
  'Work',
  'Health',
  'Study',
  'Shopping',
  'Finance',
  'Errands',
  'Creative',
  'Other',
];

export const SettingsScreen: React.FC = () => {
  const { colors, preferences, updatePreference, setThemeMode, isDark } = useSettings();
  const { tasks } = useTasks();

  const [permissionInfo, setPermissionInfo] = useState<string>('Checking...');
  const [categoriesModalVisible, setCategoriesModalVisible] = useState(false);
  const [remindersModalVisible, setRemindersModalVisible] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    notificationsService.getPermissionStatus().then((res) => {
      if (isMounted) setPermissionInfo(res.status);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleExportData = () => {
    hapticsService.selection();
    Alert.alert(
      'Offline Data Privacy',
      `You currently have ${tasks.length} tasks (${completedCount} completed) stored safely in your local SQLite database (tudoo.db).\n\nTudoo never sends your personal data anywhere. 100% private, offline, and yours.`,
      [{ text: 'Got it' }]
    );
  };

  const handleThemeChange = (mode: ThemeMode) => {
    hapticsService.selection();
    setThemeMode(mode);
  };

  const handleTestNotification = async () => {
    hapticsService.selection();
    try {
      await notificationsService.scheduleTaskReminder({
        id: 'test_notification',
        title: 'Tudoo Friendly Reminder 🐰',
        description: 'You are doing great! Keep up the good work.',
        completed: false,
        priority: 'medium',
        category: 'Personal',
        subtasks: [],
        reminderEnabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      Alert.alert('Notification Sent', 'A test reminder has been queued locally!');
    } catch {
      Alert.alert('Permission Needed', 'Please enable notifications in your device settings.');
    }
  };

  // Compute category task counts for Categories screen
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORY_LIST.forEach((c) => (counts[c] = 0));
    tasks.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tasks]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Settings ⚙️</Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Customize your Tudoo companion experience
          </Text>
        </View>

        {/* Mascot App Brand Banner */}
        <View
          style={[
            styles.brandCard,
            shadows.card,
            {
              backgroundColor: colors.card,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(167, 136, 250, 0.15)',
            },
          ]}
        >
          <BunnyMascot mood="holding_heart" size={68} />
          <View style={styles.brandTextCol}>
            <Text style={[styles.appName, { color: colors.primary }]}>Tudoo</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Your Everyday Productivity Companion
            </Text>
            <View style={[styles.versionBadge, { backgroundColor: isDark ? '#26203D' : '#F3EEFF' }]}>
              <Text style={[styles.versionText, { color: colors.primary }]}>
                v1.0.0 • 100% Offline & Private
              </Text>
            </View>
          </View>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
          <View
            style={[
              styles.settingCard,
              shadows.soft,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.themeOptionsRow}>
              {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
                const isSelected = preferences.themeMode === mode;
                const iconName: keyof typeof Ionicons.glyphMap =
                  mode === 'light'
                    ? 'sunny-outline'
                    : mode === 'dark'
                    ? 'moon-outline'
                    : 'phone-portrait-outline';

                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => handleThemeChange(mode)}
                    style={[
                      styles.themeOptionBtn,
                      {
                        backgroundColor: isSelected
                          ? colors.primary
                          : isDark
                          ? '#26203D'
                          : '#F3EEFF',
                        borderColor: isSelected ? colors.primary : colors.border,
                      },
                    ]}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={isSelected ? '#FFFFFF' : colors.textPrimary}
                    />
                    <Text
                      style={[
                        styles.themeOptionText,
                        {
                          color: isSelected ? '#FFFFFF' : colors.textPrimary,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* Feature Hub (Categories & Reminders matching Screen 8, 9) */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ORGANIZATION</Text>
          <View
            style={[
              styles.settingCard,
              shadows.soft,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Categories Screen 8 Launcher */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                hapticsService.selection();
                setCategoriesModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconWrap, { backgroundColor: isDark ? '#26203D' : '#F3EEFF' }]}>
                  <Ionicons name="folder-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Categories
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Manage personal, work, health, study & more
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Reminders Screen 9 Launcher */}
            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                hapticsService.selection();
                setRemindersModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconWrap, { backgroundColor: isDark ? '#26203D' : '#F3EEFF' }]}>
                  <Ionicons name="notifications-outline" size={20} color={colors.secondary} />
                </View>
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Reminders & Alerts
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Configure notification sounds, vibration & quiet hours
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Experience Toggles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>EXPERIENCE</Text>
          <View
            style={[
              styles.settingCard,
              shadows.soft,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {/* Haptics */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="finger-print-outline" size={20} color={colors.primary} />
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Haptic Feedback
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Gentle tactile clicks on interactions
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.hapticsEnabled}
                onValueChange={(val) => updatePreference('hapticsEnabled', val)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Celebrations */}
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Ionicons name="sparkles-outline" size={20} color={colors.secondary} />
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Bunny Celebrations
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    Joyful mascot confetti when completing daily goals
                  </Text>
                </View>
              </View>
              <Switch
                value={preferences.celebrationsEnabled}
                onValueChange={(val) => updatePreference('celebrationsEnabled', val)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* Data & Privacy */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA & STORAGE</Text>
          <View
            style={[
              styles.settingCard,
              shadows.soft,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              style={styles.actionRow}
              onPress={handleExportData}
              activeOpacity={0.7}
            >
              <View style={styles.settingInfo}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
                <View style={styles.settingTextCol}>
                  <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                    Local Database (SQLite)
                  </Text>
                  <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                    {tasks.length} tasks stored 100% offline on this device
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Screen 8: Categories Modal */}
      <Modal
        visible={categoriesModalVisible}
        animationType="slide"
        onRequestClose={() => setCategoriesModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeaderRow}>
            <TouchableOpacity
              onPress={() => setCategoriesModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalScreenTitle, { color: colors.textPrimary }]}>
              Categories
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.categoriesList}>
            {CATEGORY_LIST.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const meta = categoryMeta[cat] || categoryMeta.Personal;
              const bg = isDark ? meta.bgDark : meta.bgLight;
              const textColor = isDark ? meta.textDark : meta.textLight;

              return (
                <View
                  key={cat}
                  style={[
                    styles.categoryCardRow,
                    shadows.soft,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDark ? 'rgba(255,255,255,0.06)' : colors.border,
                    },
                  ]}
                >
                  <View style={[styles.catIconWrap, { backgroundColor: bg }]}>
                    <Text style={{ fontSize: 18 }}>
                      {cat === 'Personal' ? '💜' : cat === 'Work' ? '💼' : cat === 'Health' ? '🌿' : cat === 'Study' ? '📖' : cat === 'Shopping' ? '🛍️' : cat === 'Finance' ? '💰' : cat === 'Errands' ? '🛒' : cat === 'Creative' ? '🎨' : '✨'}
                    </Text>
                  </View>

                  <View style={styles.catDetails}>
                    <Text style={[styles.catTitle, { color: textColor }]}>{cat}</Text>
                    <Text style={[styles.catCount, { color: colors.textSecondary }]}>
                      {count} {count === 1 ? 'task' : 'tasks'}
                    </Text>
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                </View>
              );
            })}
          </ScrollView>
        </View>
      </Modal>

      {/* Screen 9: Reminders Modal */}
      <Modal
        visible={remindersModalVisible}
        animationType="slide"
        onRequestClose={() => setRemindersModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeaderRow}>
            <TouchableOpacity
              onPress={() => setRemindersModalVisible(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.modalScreenTitle, { color: colors.textPrimary }]}>
              Reminders
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView contentContainerStyle={styles.remindersList}>
            <View
              style={[
                styles.settingCard,
                shadows.soft,
                { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 16 },
              ]}
            >
              {/* Task Reminders Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="notifications-outline" size={22} color={colors.primary} />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                      Task Reminders
                    </Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                      Get notified about due tasks ({permissionInfo})
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferences.remindersEnabled}
                  onValueChange={(val) => updatePreference('remindersEnabled', val)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Reminder Sound */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="musical-notes-outline" size={22} color={colors.secondary} />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                      Reminder Sound
                    </Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                      Tudoo Bell (Gentle chime)
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Vibration Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="radio-outline" size={22} color={colors.primary} />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                      Vibration
                    </Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                      Gentle haptic vibration pattern
                    </Text>
                  </View>
                </View>
                <Switch
                  value={preferences.hapticsEnabled}
                  onValueChange={(val) => updatePreference('hapticsEnabled', val)}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Quiet Hours */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Ionicons name="moon-outline" size={22} color={colors.accentLavender} />
                  <View style={styles.settingTextCol}>
                    <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                      Quiet Hours
                    </Text>
                    <Text style={[styles.settingSub, { color: colors.textSecondary }]}>
                      10:00 PM - 7:00 AM
                    </Text>
                  </View>
                </View>
                <Switch
                  value={quietHoursEnabled}
                  onValueChange={(val) => {
                    hapticsService.selection();
                    setQuietHoursEnabled(val);
                  }}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Test Notification Button */}
            <GradientButton
              title="Send Test Notification"
              onPress={handleTestNotification}
              icon="send-outline"
              size="lg"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 90,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  brandTextCol: {
    marginLeft: 16,
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 12.5,
    marginTop: 2,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
    marginTop: 6,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  settingCard: {
    borderRadius: borderRadius.xl,
    padding: 14,
    borderWidth: 1,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    gap: 6,
  },
  themeOptionText: {
    fontSize: 12.5,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  modalContainer: {
    flex: 1,
    paddingTop: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalScreenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  categoryCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  catIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  catDetails: {
    flex: 1,
  },
  catTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  catCount: {
    fontSize: 12,
    marginTop: 2,
  },
  remindersList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});
