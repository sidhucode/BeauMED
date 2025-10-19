import React, {useCallback, useMemo} from 'react';
import {SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable, ActionSheetIOS, Platform, Alert} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useNotifications} from '../state/NotificationsContext';
import {useTheme, ThemeColors, ThemeName} from '../state/ThemeContext';

const quickActions = [
  {emoji: '📈', label: 'Symptoms', route: 'Symptoms' as const, color: '#3b82f6'},
  {emoji: '💊', label: 'Medications', route: 'Medications' as const, color: '#22c55e'},
  {emoji: '🤖', label: 'AI Assistant', route: 'Assistant' as const, color: '#06b6d4'},
  {emoji: '🩺', label: 'Doctors', route: 'Doctors' as const, color: '#f59e0b'},
];

const activityStats = [
  {value: '72', label: 'Heart Rate', color: '#3b82f6'},
  {value: '7.3', label: 'Sleep (hrs)', color: '#22c55e'},
  {value: '8,432', label: 'Steps', color: '#f59e0b'},
  {value: '120/80', label: 'BP (mmHg)', color: '#06b6d4'},
];

export default function DashboardScreen() {
  const {navigate} = useRouter();
  const {colors, theme} = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const {items, unreadCount, markAllRead, markRead, deleteItem, snooze} = useNotifications();

  const reminders = useMemo(() => {
    const sorted = [...items].sort((a, b) => Number(a.read) - Number(b.read));
    return sorted.slice(0, 3);
  }, [items]);

  const handleReminderAction = useCallback(
    (id: number, action: 'done' | 'delete' | 'snooze') => {
      if (action === 'done') markRead(id);
      if (action === 'delete') deleteItem(id);
      if (action === 'snooze') snooze(id);
    },
    [markRead, deleteItem, snooze],
  );

  const showReminderMenu = useCallback(
    (id: number) => {
      const options = ['Cancel', 'Mark as done', 'Delete', 'Remind me later'];
      if (Platform.OS === 'ios') {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex: 0,
            destructiveButtonIndex: 2,
          },
          idx => {
            if (idx === 1) handleReminderAction(id, 'done');
            if (idx === 2) handleReminderAction(id, 'delete');
            if (idx === 3) handleReminderAction(id, 'snooze');
          },
        );
      } else {
        Alert.alert('Reminder actions', undefined, [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Mark as done', onPress: () => handleReminderAction(id, 'done')},
          {text: 'Delete', style: 'destructive', onPress: () => handleReminderAction(id, 'delete')},
          {text: 'Remind me later', onPress: () => handleReminderAction(id, 'snooze')},
        ]);
      }
    },
    [handleReminderAction],
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Good Morning</Text>
            <Text style={styles.headerTitle}>John Doe</Text>
          </View>
          <Pressable
            onPress={() => navigate('Notifications')}
            onLongPress={() =>
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: ['Cancel', 'Mark all as read', 'Notification settings'],
                  destructiveButtonIndex: 1,
                  cancelButtonIndex: 0,
                  title: 'Notifications',
                },
                idx => {
                  if (idx === 1) markAllRead();
                  if (idx === 2) navigate('Profile');
                },
              )
            }
            style={styles.bellWrap}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Text style={styles.bell}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </Pressable>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryHeart}>❤</Text>
          </View>
          <View>
            <Text style={styles.summaryLabel}>Health Summary</Text>
            <Text style={styles.summaryValue}>Stable ✓</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map(action => (
              <Pressable key={action.label} style={styles.quickCard} onPress={() => navigate(action.route)}>
                <View style={[styles.quickIcon, {backgroundColor: action.color}]}>
                  <Text style={styles.quickEmoji}>{action.emoji}</Text>
                </View>
                <Text style={styles.quickLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          <View style={styles.card}>
            {reminders.length === 0 ? (
              <View style={styles.reminderEmpty}>
                <Text style={styles.reminderEmptyText}>All caught up! No upcoming reminders.</Text>
              </View>
            ) : (
              reminders.map((reminder, index) => (
                <View key={reminder.id} style={[styles.reminderRow, index > 0 && styles.rowDivider]}>
                  <View style={styles.reminderLeft}>
                    <View style={styles.reminderIcon}>
                      <Text style={styles.reminderEmoji}>
                        {reminder.kind === 'alert' ? '⚠️' : reminder.kind === 'message' ? '✉️' : '💊'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.reminderTitle}>{reminder.title}</Text>
                      <Text style={styles.reminderTime}>{reminder.time}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => showReminderMenu(reminder.id)}>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.card}>
            <View style={styles.activityGrid}>
              {activityStats.map(stat => (
                <View key={stat.label} style={styles.activityItem}>
                  <Text style={[styles.activityValue, {color: stat.color}]}>{stat.value}</Text>
                  <Text style={styles.activityLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Pressable style={styles.fab} onPress={() => {}}>
          <Text style={styles.fabText}>Connect</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, theme: ThemeName) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    scroll: {paddingBottom: 120},
    header: {
      backgroundColor: colors.headerBackground,
      padding: 20,
      paddingTop: 24,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerSub: {color: colors.headerText, opacity: 0.85},
    headerTitle: {color: colors.headerText, fontSize: 22, fontWeight: '700'},
    bellWrap: {paddingHorizontal: 8, paddingVertical: 4, position: 'relative'},
    bell: {fontSize: 20, color: colors.headerText},
    badge: {
      position: 'absolute',
      right: 2,
      top: 2,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colors.badgeBackground,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {color: colors.badgeText, fontSize: 11, fontWeight: '700'},
    summaryCard: {
      marginHorizontal: 16,
      marginTop: -16,
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: theme === 'dark' ? StyleSheet.hairlineWidth : 0,
      borderColor: colors.border,
    },
    summaryIcon: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center'},
    summaryHeart: {color: '#ffffff', fontSize: 20},
    summaryLabel: {color: colors.muted},
    summaryValue: {color: colors.text, fontWeight: '600'},
    section: {paddingHorizontal: 16, paddingTop: 20},
    sectionTitle: {fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 10},
    quickGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
    quickCard: {
      width: '48%',
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    quickIcon: {width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
    quickEmoji: {fontSize: 20},
    quickLabel: {fontSize: 14, color: colors.text},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    reminderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12},
    rowDivider: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border},
    reminderLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
    reminderIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    reminderEmoji: {fontSize: 18},
    reminderTitle: {color: colors.text, fontWeight: '500'},
    reminderTime: {color: colors.muted, fontSize: 12},
    chevron: {color: colors.muted, fontSize: 22},
    reminderEmpty: {paddingHorizontal: 16, paddingVertical: 18},
    reminderEmptyText: {textAlign: 'center', color: colors.muted, fontSize: 13},
    activityGrid: {flexDirection: 'row', flexWrap: 'wrap'},
    activityItem: {width: '50%', padding: 14, alignItems: 'center'},
    activityValue: {fontSize: 24, fontWeight: '700'},
    activityLabel: {fontSize: 12, color: colors.muted, marginTop: 2},
    fab: {
      position: 'absolute',
      right: 20,
      bottom: 90,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 10,
      backgroundColor: colors.fabBackground,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 4,
    },
    fabText: {color: colors.fabText, fontSize: 16, fontWeight: '600'},
  });
