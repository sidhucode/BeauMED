import React from 'react';
import {SafeAreaView, ScrollView, View, Text, StyleSheet, Pressable} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

export default function DashboardScreen() {
  const {navigate} = useRouter();

  const quickActions = [
    {emoji: '📈', label: 'Symptoms', route: 'Symptoms' as const, color: '#3b82f6'},
    {emoji: '💊', label: 'Medications', route: 'Medications' as const, color: '#22c55e'},
    {emoji: '🤖', label: 'AI Assistant', route: 'Assistant' as const, color: '#06b6d4'},
    {emoji: '🩺', label: 'Doctors', route: 'Doctors' as const, color: '#f59e0b'},
  ];

  const reminders = [
    {time: '8:00 AM', title: 'Take Metformin', type: 'medication'},
    {time: '2:00 PM', title: 'Take Lisinopril', type: 'medication'},
    {time: 'Tomorrow', title: 'Doctor Appointment', type: 'appointment'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}> 
          <View>
            <Text style={styles.headerSub}>Good Morning</Text>
            <Text style={styles.headerTitle}>John Doe</Text>
          </View>
          <Text style={styles.bell}>🔔</Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}><Text style={styles.summaryHeart}>❤</Text></View>
          <View>
            <Text style={styles.summaryLabel}>Health Summary</Text>
            <Text style={styles.summaryValue}>Stable ✓</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickGrid}>
            {quickActions.map(a => (
              <Pressable key={a.label} style={styles.quickCard} onPress={() => navigate(a.route)}>
                <View style={[styles.quickIcon, {backgroundColor: a.color}]}> 
                  <Text style={styles.quickEmoji}>{a.emoji}</Text>
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
          <View style={styles.card}>
            {reminders.map((r, i) => (
              <View key={i} style={[styles.reminderRow, i > 0 && styles.rowDivider]}>
                <View style={styles.reminderLeft}>
                  <View style={styles.reminderIcon}> 
                    <Text style={styles.reminderEmoji}>{r.type === 'medication' ? '💊' : '🩺'}</Text>
                  </View>
                  <View>
                    <Text style={styles.reminderTitle}>{r.title}</Text>
                    <Text style={styles.reminderTime}>{r.time}</Text>
                  </View>
                </View>
                <Text style={styles.chev}>{'›'}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Activity</Text>
          <View style={styles.card}>
            <View style={styles.activityGrid}>
              {[
                {value: '72', label: 'Heart Rate', color: '#3b82f6'},
                {value: '7.3', label: 'Sleep (hrs)', color: '#22c55e'},
                {value: '8,432', label: 'Steps', color: '#f59e0b'},
                {value: '120/80', label: 'BP (mmHg)', color: '#06b6d4'},
              ].map((m) => (
                <View key={m.label} style={styles.activityItem}>
                  <Text style={[styles.activityValue, {color: m.color}]}>{m.value}</Text>
                  <Text style={styles.activityLabel}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <Pressable style={styles.fab} onPress={() => {}}>
          <Text style={styles.fabPlus}>＋</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  scroll: {paddingBottom: 120},
  header: {
    backgroundColor: '#4f46e5',
    padding: 20,
    paddingTop: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSub: {color: 'white', opacity: 0.9},
  headerTitle: {color: 'white', fontSize: 22, fontWeight: '700'},
  bell: {fontSize: 20, color: 'white'},
  summaryCard: {
    marginHorizontal: 16,
    marginTop: -16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 2,
  },
  summaryIcon: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center'},
  summaryHeart: {color: 'white', fontSize: 20},
  summaryLabel: {color: '#334155'},
  summaryValue: {color: '#111827', fontWeight: '600'},
  section: {paddingHorizontal: 16, paddingTop: 20},
  sectionTitle: {fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 10},
  quickGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  quickCard: {width: '48%', backgroundColor: 'white', borderRadius: 12, padding: 14, elevation: 1},
  quickIcon: {width: 48, height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  quickEmoji: {fontSize: 20},
  quickLabel: {fontSize: 14, color: '#111827'},
  card: {backgroundColor: 'white', borderRadius: 12, overflow: 'hidden'},
  reminderRow: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12},
  rowDivider: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb'},
  reminderLeft: {flexDirection: 'row', alignItems: 'center', gap: 10},
  reminderIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center'},
  reminderEmoji: {fontSize: 18},
  reminderTitle: {color: '#111827', fontWeight: '500'},
  reminderTime: {color: '#6b7280', fontSize: 12},
  chev: {color: '#6b7280', fontSize: 20},
  activityGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  activityItem: {width: '50%', padding: 14, alignItems: 'center'},
  activityValue: {fontSize: 24, fontWeight: '700'},
  activityLabel: {fontSize: 12, color: '#6b7280', marginTop: 2},
  fab: {position: 'absolute', right: 20, bottom: 90, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', elevation: 4},
  fabPlus: {color: 'white', fontSize: 24, lineHeight: 24},
});

