import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  Modal,
  ScrollView as RNScrollView,
  Switch,
} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useMedications} from '../state/MedicationsContext';
import {useTheme, ThemeColors} from '../state/ThemeContext';

const ITEM_HEIGHT = 40;
const PADDING_COUNT = 2;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const HIGHLIGHT_OFFSET = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

type Params = {
  mode: 'add' | 'edit';
  medicationId?: string;
};

export default function MedicationFormScreen() {
  const {goBack, params} = useRouter();
  const {items, addMedication, updateMedication} = useMedications();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const formParams = (params as Params) ?? {mode: 'add'};
  const existing = useMemo(() => items.find(item => item.medicationId === formParams.medicationId), [items, formParams.medicationId]);

  const [name, setName] = useState(existing?.name ?? '');
  const [dosage, setDosage] = useState(existing?.dosage ?? '');
  const [frequency, setFrequency] = useState(existing?.frequency ?? '');
  const [reminders, setReminders] = useState<string[]>(existing?.reminders ?? []);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [active, setActive] = useState(existing?.active ?? true);
  const [currentReminderTime, setCurrentReminderTime] = useState('');
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const hours = useMemo(() => Array.from({length: 12}, (_, i) => (i + 1).toString()), []);
  const minutes = useMemo(() => Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')), []);
  const periods = useMemo(() => ['AM', 'PM'], []);
  const paddedHours = useMemo(() => Array(PADDING_COUNT).fill('').concat(hours, Array(PADDING_COUNT).fill('')), [hours]);
  const paddedMinutes = useMemo(
    () => Array(PADDING_COUNT).fill('').concat(minutes, Array(PADDING_COUNT).fill('')),
    [minutes],
  );
  const paddedPeriods = useMemo(
    () => Array(PADDING_COUNT).fill('').concat(periods, Array(PADDING_COUNT).fill('')),
    [periods],
  );

  const [hourIndex, setHourIndex] = useState(7);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);

  const hourRef = useRef<RNScrollView>(null);
  const minuteRef = useRef<RNScrollView>(null);
  const periodRef = useRef<RNScrollView>(null);

  const save = async () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim()) {
      Alert.alert('Missing info', 'Please fill in medication name, dosage, and frequency.');
      return;
    }

    try {
      const medicationData = {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        reminders,
        notes: notes.trim(),
        active,
      };

      if (formParams.mode === 'edit' && existing) {
        await updateMedication(existing.medicationId, medicationData);
        Alert.alert('Success', 'Medication updated successfully');
      } else {
        await addMedication(medicationData);
        Alert.alert('Success', 'Medication added successfully');
      }
      goBack();
    } catch (error: any) {
      console.error('Save medication error:', error);
      Alert.alert('Error', error.message || 'Failed to save medication');
    }
  };

  const openTimePicker = () => {
    // Reset to default time (8:00 AM)
    setHourIndex(7);
    setMinuteIndex(0);
    setPeriodIndex(0);
    setTimePickerVisible(true);
  };

  const addReminder = () => {
    const timeString = `${hours[hourIndex]}:${minutes[minuteIndex]} ${periods[periodIndex]}`;
    if (!reminders.includes(timeString)) {
      setReminders([...reminders, timeString]);
    }
    setTimePickerVisible(false);
  };

  const removeReminder = (time: string) => {
    setReminders(reminders.filter(t => t !== time));
  };

  useEffect(() => {
    if (timePickerVisible) {
      const timeout = setTimeout(() => {
        hourRef.current?.scrollTo({y: (hourIndex + PADDING_COUNT) * ITEM_HEIGHT, animated: false});
        minuteRef.current?.scrollTo({y: (minuteIndex + PADDING_COUNT) * ITEM_HEIGHT, animated: false});
        periodRef.current?.scrollTo({y: (periodIndex + PADDING_COUNT) * ITEM_HEIGHT, animated: false});
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [timePickerVisible, hourIndex, minuteIndex, periodIndex]);

  const closeTimePicker = () => setTimePickerVisible(false);

  const updateIndexFromOffset = (
    offset: number,
    dataLength: number,
    current: number,
    setIndex: (value: number) => void,
  ) => {
    const rawIndex = Math.round(offset / ITEM_HEIGHT);
    let derived = rawIndex - PADDING_COUNT;
    if (derived < 0) derived = 0;
    if (derived > dataLength - 1) derived = dataLength - 1;
    if (derived !== current) setIndex(derived);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{formParams.mode === 'edit' ? 'Edit Medication' : 'Add Medication'}</Text>
        <Pressable onPress={goBack}>
          <Text style={styles.close}>Close ✕</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Metformin"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 500mg"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g., Twice daily"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.label}>Reminders</Text>
            <Pressable onPress={openTimePicker}>
              <Text style={styles.addReminderText}>+ Add Time</Text>
            </Pressable>
          </View>
          {reminders.length > 0 ? (
            <View style={styles.remindersList}>
              {reminders.map((time, index) => (
                <View key={index} style={styles.reminderChip}>
                  <Text style={styles.reminderChipText}>{time}</Text>
                  <Pressable onPress={() => removeReminder(time)}>
                    <Text style={styles.reminderChipClose}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.placeholderText}>No reminder times set</Text>
          )}
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Notes (Optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={notes}
            onChangeText={setNotes}
            placeholder="e.g., Take with food"
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        <View style={[styles.field, styles.reminderRow]}>
          <Text style={styles.label}>Active Medication</Text>
          <Switch
            value={active}
            onValueChange={setActive}
            trackColor={{false: '#d1d5db', true: colors.primary}}
            thumbColor={active ? colors.primaryText : '#ffffff'}
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryText}>Save</Text>
        </Pressable>
      </View>

      <Modal visible={timePickerVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <Pressable style={{flex: 1}} onPress={closeTimePicker} />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closeTimePicker}>
                <Text style={styles.modalAction}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Add Reminder Time</Text>
              <Pressable onPress={addReminder}>
                <Text style={styles.modalAction}>Add</Text>
              </Pressable>
            </View>
            <View style={styles.wheelContainer}>
              <View style={styles.wheelHighlight} pointerEvents="none" />
              <View style={styles.wheelColumn}>
                <RNScrollView
                  ref={hourRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, hours.length, hourIndex, setHourIndex)
                  }
                  onScroll={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, hours.length, hourIndex, setHourIndex)
                  }
                  scrollEventThrottle={16}
                >
                  {paddedHours.map((value, idx) => (
                    <View
                      key={`hour-${idx}`}
                      style={[styles.wheelItem, idx - PADDING_COUNT === hourIndex && styles.wheelItemActive]}
                    >
                      <Text style={idx - PADDING_COUNT === hourIndex ? styles.wheelTextActive : styles.wheelText}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </RNScrollView>
              </View>
              <View style={styles.wheelColumn}>
                <RNScrollView
                  ref={minuteRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, minutes.length, minuteIndex, setMinuteIndex)
                  }
                  onScroll={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, minutes.length, minuteIndex, setMinuteIndex)
                  }
                  scrollEventThrottle={16}
                >
                  {paddedMinutes.map((value, idx) => (
                    <View
                      key={`minute-${idx}`}
                      style={[styles.wheelItem, idx - PADDING_COUNT === minuteIndex && styles.wheelItemActive]}
                    >
                      <Text style={idx - PADDING_COUNT === minuteIndex ? styles.wheelTextActive : styles.wheelText}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </RNScrollView>
              </View>
              <View style={styles.wheelColumn}>
                <RNScrollView
                  ref={periodRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, periods.length, periodIndex, setPeriodIndex)
                  }
                  onScroll={event =>
                    updateIndexFromOffset(event.nativeEvent.contentOffset.y, periods.length, periodIndex, setPeriodIndex)
                  }
                  scrollEventThrottle={16}
                >
                  {paddedPeriods.map((value, idx) => (
                    <View
                      key={`period-${idx}`}
                      style={[styles.wheelItem, idx - PADDING_COUNT === periodIndex && styles.wheelItemActive]}
                    >
                      <Text style={idx - PADDING_COUNT === periodIndex ? styles.wheelTextActive : styles.wheelText}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </RNScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: {color: colors.headerText, fontSize: 18, fontWeight: '700'},
    close: {color: colors.headerText, fontWeight: '600'},
    content: {padding: 16, gap: 16},
    field: {gap: 6},
    fieldHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
    label: {color: colors.muted, fontWeight: '600'},
    addReminderText: {color: colors.primary, fontWeight: '600', fontSize: 14},
    input: {
      height: 44,
      borderRadius: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.inputText,
    },
    notesInput: {
      height: 80,
      paddingTop: 12,
      paddingBottom: 12,
    },
    inputText: {color: colors.inputText, fontSize: 16},
    placeholderText: {color: colors.muted, fontSize: 14, marginTop: 8},
    remindersList: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8},
    reminderChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    reminderChipText: {color: colors.primaryText, fontSize: 14, fontWeight: '600'},
    reminderChipClose: {color: colors.primaryText, fontSize: 16, fontWeight: '700'},
    reminderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4},
    footer: {padding: 16},
    primaryBtn: {
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryText: {color: colors.primaryText, fontWeight: '700', fontSize: 16},
    modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay},
    modalContent: {backgroundColor: colors.card, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16},
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    modalTitle: {color: colors.text, fontSize: 16, fontWeight: '700'},
    modalAction: {color: colors.primary, fontWeight: '600'},
    wheelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 16,
      position: 'relative',
      height: WHEEL_HEIGHT,
    },
    wheelHighlight: {
      position: 'absolute',
      left: 16,
      right: 16,
      top: HIGHLIGHT_OFFSET,
      height: ITEM_HEIGHT,
      borderRadius: 10,
      backgroundColor: colors.accent,
      opacity: 0.7,
    },
    wheelColumn: {flex: 1, marginHorizontal: 4, overflow: 'hidden'},
    wheelItem: {height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center'},
    wheelItemActive: {},
    wheelText: {color: colors.muted, fontSize: 18},
    wheelTextActive: {color: colors.text, fontSize: 20, fontWeight: '700'},
  });
