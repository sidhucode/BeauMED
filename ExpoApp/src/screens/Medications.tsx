import React, {useMemo} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable, Switch, Alert, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useMedications} from '../state/MedicationsContext';
import {useTheme, ThemeColors} from '../state/ThemeContext';

export default function MedicationsScreen() {
  const {navigate} = useRouter();
  const {items, removeMedication, toggleReminder} = useMedications();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const scanPrescription = () => {
    Alert.alert('Camera Access', 'This would open the camera to scan your prescription.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Medications</Text>
      </View>
      <Text style={styles.headerSub}>Manage your prescriptions and reminders</Text>

      <View style={styles.scanWrap}>
        <Pressable style={styles.outlineBtn} onPress={scanPrescription}>
          <Text style={styles.outlineText}>📷 Scan Prescription</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.cardLeft}>
                <View style={styles.pillIcon}>
                  <Text style={styles.pillEmoji}>💊</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.muted}>{item.dosage}</Text>
                  <Text style={styles.muted}>{item.frequency}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable style={styles.iconBtn} onPress={() => navigate('MedicationForm', {mode: 'edit', id: item.id})}>
                  <Text style={styles.iconText}>✏️</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => removeMedication(item.id)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            <View style={[styles.rowBetween, styles.topBorder]}>
              <Text style={styles.muted}>⏰ Next: {item.nextDose}</Text>
              <View style={styles.reminderRow}>
                <Text style={styles.muted}>Reminder</Text>
                <Switch
                  value={item.reminder}
                  onValueChange={value => toggleReminder(item.id, value)}
                  trackColor={{false: '#d1d5db', true: colors.primary}}
                  thumbColor={item.reminder ? colors.primaryText : '#ffffff'}
                />
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable style={styles.primaryBtn} onPress={() => navigate('MedicationForm', {mode: 'add'})}>
              <Text style={styles.primaryBtnText}>＋ Add Medication</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    back: {color: colors.headerText, fontSize: 26, paddingRight: 12},
    headerTitle: {color: colors.headerText, fontSize: 20, fontWeight: '700'},
    headerSub: {
      color: colors.headerText,
      opacity: 0.85,
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    scanWrap: {padding: 16, gap: 12},
    outlineBtn: {
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    outlineText: {color: colors.text, fontWeight: '600'},
    listContent: {paddingHorizontal: 16, paddingBottom: 120},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    rowBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    cardLeft: {flexDirection: 'row', gap: 10, alignItems: 'center'},
    pillIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    pillEmoji: {fontSize: 18},
    name: {fontWeight: '600', fontSize: 16, color: colors.text},
    muted: {color: colors.muted, fontSize: 12},
    cardActions: {flexDirection: 'row', gap: 6},
    iconBtn: {height: 36, width: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
    iconText: {fontSize: 16, color: colors.text},
    deleteText: {color: '#b91c1c', fontSize: 16},
    topBorder: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10, marginTop: 8},
    reminderRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    footer: {paddingVertical: 16},
    primaryBtn: {
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryBtnText: {color: colors.primaryText, fontWeight: '600'},
  });

