import React, {useMemo, useRef, useState, useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, Modal, ScrollView as RNScrollView} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useMedications} from '../state/MedicationsContext';

const ITEM_HEIGHT = 40;
const PADDING_COUNT = 2;
const VISIBLE_ROWS = 5;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ROWS;
const HIGHLIGHT_OFFSET = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2;

type Params = {
  mode: 'add' | 'edit';
  id?: number;
};

export default function MedicationFormScreen() {
  const {goBack, params} = useRouter();
  const {items, addMedication, updateMedication} = useMedications();

  const formParams = (params as Params) ?? {mode: 'add'};
  const existing = useMemo(() => items.find(item => item.id === formParams.id), [items, formParams.id]);

  const [name, setName] = useState(existing?.name ?? '');
  const [dosage, setDosage] = useState(existing?.dosage ?? '');
  const [frequency, setFrequency] = useState(existing?.frequency ?? '');
  const [nextDose, setNextDose] = useState(existing?.nextDose ?? '');
  const [reminder, setReminder] = useState(existing?.reminder ?? true);
  const [timePickerVisible, setTimePickerVisible] = useState(false);

  const hours = useMemo(() => Array.from({length: 12}, (_, i) => (i + 1).toString()), []);
  const minutes = useMemo(() => Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')), []);
  const periods = useMemo(() => ['AM', 'PM'], []);
  const paddedHours = useMemo(() => Array(PADDING_COUNT).fill('').concat(hours, Array(PADDING_COUNT).fill('')), [hours]);
  const paddedMinutes = useMemo(() => Array(PADDING_COUNT).fill('').concat(minutes, Array(PADDING_COUNT).fill('')), [minutes]);
  const paddedPeriods = useMemo(() => Array(PADDING_COUNT).fill('').concat(periods, Array(PADDING_COUNT).fill('')), [periods]);

  const [hourIndex, setHourIndex] = useState(7);
  const [minuteIndex, setMinuteIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);

  const hourRef = useRef<RNScrollView>(null);
  const minuteRef = useRef<RNScrollView>(null);
  const periodRef = useRef<RNScrollView>(null);

  const save = () => {
    if (!name.trim() || !dosage.trim() || !frequency.trim() || !nextDose.trim()) {
      Alert.alert('Missing info', 'Please fill all fields before saving.');
      return;
    }
    if (formParams.mode === 'edit' && existing) {
      updateMedication(existing.id, {
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        nextDose: nextDose.trim(),
        reminder,
      });
    } else {
      addMedication({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        nextDose: nextDose.trim(),
        reminder,
      });
    }
    goBack();
  };

  const openTimePicker = () => {
    const match = nextDose.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)\s*$/i);
    if (match) {
      const [, hStr, mStr, period] = match;
      const hourVal = Math.min(Math.max(parseInt(hStr, 10), 1), 12);
      const minuteVal = Math.min(Math.max(parseInt(mStr, 10), 0), 59);
      setHourIndex(hourVal - 1);
      setMinuteIndex(minuteVal);
      setPeriodIndex(period.toUpperCase() === 'PM' ? 1 : 0);
    } else {
      setHourIndex(7);
      setMinuteIndex(0);
      setPeriodIndex(0);
    }
    setTimePickerVisible(true);
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

  const applyTime = () => {
    const timeString = `${hours[hourIndex]}:${minutes[minuteIndex]} ${periods[periodIndex]}`;
    setNextDose(timeString);
    setTimePickerVisible(false);
  };

  const updateIndexFromOffset = (offset: number, dataLength: number, current: number, setIndex: (val: number) => void) => {
    const rawIndex = Math.round(offset / ITEM_HEIGHT);
    let derived = rawIndex - PADDING_COUNT;
    if (derived < 0) derived = 0;
    if (derived > dataLength - 1) derived = dataLength - 1;
    if (derived !== current) {
      setIndex(derived);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{formParams.mode === 'edit' ? 'Edit Medication' : 'Add Medication'}</Text>
        <Pressable onPress={goBack}><Text style={styles.close}>Close ✕</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Metformin" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g., 500mg" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput style={styles.input} value={frequency} onChangeText={setFrequency} placeholder="e.g., Twice daily" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Next Dose (time)</Text>
          <Pressable style={[styles.input, styles.timeInput]} onPress={openTimePicker}>
            <Text style={nextDose ? styles.inputText : styles.placeholderText}>
              {nextDose || 'Select time'}
            </Text>
          </Pressable>
        </View>
        <View style={styles.reminderRow}>
          <Text style={styles.label}>Reminder</Text>
          <Pressable
            style={[styles.reminderToggle, reminder ? styles.toggleOn : styles.toggleOff]}
            onPress={() => setReminder(r => !r)}
          >
            <Text style={reminder ? styles.toggleText : styles.toggleTextOff}>{reminder ? 'On' : 'Off'}</Text>
          </Pressable>
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
              <Pressable onPress={closeTimePicker}><Text style={styles.modalAction}>Cancel</Text></Pressable>
              <Text style={styles.modalTitle}>Select Time</Text>
              <Pressable onPress={applyTime}><Text style={styles.modalAction}>Save</Text></Pressable>
            </View>
            <View style={styles.wheelContainer}>
              <View style={styles.wheelHighlight} pointerEvents="none" />
              <View style={styles.wheelColumn}>
                <RNScrollView
                  ref={hourRef}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, hours.length, hourIndex, setHourIndex)}
                  onScroll={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, hours.length, hourIndex, setHourIndex)}
                  scrollEventThrottle={16}
                >
                  {paddedHours.map((val, idx) => (
                    <View key={`hour-${idx}`} style={[styles.wheelItem, (idx - PADDING_COUNT) === hourIndex && styles.wheelItemActive]}>
                      <Text style={(idx - PADDING_COUNT) === hourIndex ? styles.wheelTextActive : styles.wheelText}>{val}</Text>
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
                  onMomentumScrollEnd={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, minutes.length, minuteIndex, setMinuteIndex)}
                  onScroll={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, minutes.length, minuteIndex, setMinuteIndex)}
                  scrollEventThrottle={16}
                >
                  {paddedMinutes.map((val, idx) => (
                    <View key={`minute-${idx}`} style={[styles.wheelItem, (idx - PADDING_COUNT) === minuteIndex && styles.wheelItemActive]}>
                      <Text style={(idx - PADDING_COUNT) === minuteIndex ? styles.wheelTextActive : styles.wheelText}>{val}</Text>
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
                  onMomentumScrollEnd={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, periods.length, periodIndex, setPeriodIndex)}
                  onScroll={e => updateIndexFromOffset(e.nativeEvent.contentOffset.y, periods.length, periodIndex, setPeriodIndex)}
                  scrollEventThrottle={16}
                >
                  {paddedPeriods.map((val, idx) => (
                    <View key={`period-${idx}`} style={[styles.wheelItem, (idx - PADDING_COUNT) === periodIndex && styles.wheelItemActive]}>
                      <Text style={(idx - PADDING_COUNT) === periodIndex ? styles.wheelTextActive : styles.wheelText}>{val}</Text>
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

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 12},
  headerTitle: {color: 'white', fontSize: 18, fontWeight: '700'},
  close: {color: 'white', fontWeight: '600'},
  content: {padding: 16, gap: 16},
  field: {gap: 6},
  label: {color: '#374151', fontWeight: '600'},
  input: {height: 44, borderRadius: 10, paddingHorizontal: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#e5e7eb'},
  timeInput: {justifyContent: 'center'},
  inputText: {color: '#111827', fontSize: 16},
  placeholderText: {color: '#9ca3af', fontSize: 16},
  reminderRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4},
  reminderToggle: {width: 80, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  toggleOn: {backgroundColor: '#4f46e5'},
  toggleOff: {backgroundColor: '#e5e7eb'},
  toggleText: {color: 'white', fontWeight: '600'},
  toggleTextOff: {color: '#374151', fontWeight: '600'},
  footer: {padding: 16},
  primaryBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5'},
  primaryText: {color: 'white', fontWeight: '700', fontSize: 16},
  modalBackdrop: {flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)'},
  modalContent: {backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 16},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12},
  modalTitle: {color: '#111827', fontSize: 16, fontWeight: '700'},
  modalAction: {color: '#4f46e5', fontWeight: '600'},
  wheelContainer: {flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 16, position: 'relative', height: WHEEL_HEIGHT},
  wheelHighlight: {position: 'absolute', left: 16, right: 16, top: HIGHLIGHT_OFFSET, height: ITEM_HEIGHT, borderRadius: 10, backgroundColor: '#eef2ff', opacity: 0.6},
  wheelColumn: {flex: 1, marginHorizontal: 4, overflow: 'hidden'},
  wheelItem: {height: ITEM_HEIGHT, alignItems: 'center', justifyContent: 'center'},
  wheelItemActive: {},
  wheelText: {color: '#94a3b8', fontSize: 18},
  wheelTextActive: {color: '#1f2937', fontSize: 20, fontWeight: '700'},
});
