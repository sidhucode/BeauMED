import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable, Switch, Alert, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

type Medication = { id: number; name: string; dosage: string; frequency: string; nextDose: string; reminder: boolean };

export default function MedicationsScreen() {
  const {navigate} = useRouter();
  const [items, setItems] = useState<Medication[]>([
    { id: 1, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', nextDose: '8:00 AM', reminder: true },
    { id: 2, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', nextDose: '2:00 PM', reminder: true },
    { id: 3, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', nextDose: '9:00 PM', reminder: false },
  ]);

  const scanPrescription = () => {
    Alert.alert('Camera Access', 'This would open the camera to scan your prescription.');
  };

  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Medications</Text>
      </View>
      <Text style={styles.headerSub}>Manage your prescriptions and reminders</Text>

      <View style={{padding: 16, gap: 12}}>
        <Pressable style={styles.outlineBtn} onPress={scanPrescription}>
          <Text style={styles.outlineText}>📷 Scan Prescription</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 120}}
        data={items}
        keyExtractor={i => String(i.id)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{flexDirection: 'row', gap: 10}}>
                <View style={styles.pillIcon}><Text>💊</Text></View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.muted}>{item.dosage}</Text>
                  <Text style={styles.muted}>{item.frequency}</Text>
                </View>
              </View>
              <View style={{flexDirection: 'row', gap: 6}}>
                <Pressable style={styles.iconBtn}><Text>✏️</Text></Pressable>
                <Pressable style={styles.iconBtn} onPress={() => remove(item.id)}><Text style={{color: '#b91c1c'}}>🗑️</Text></Pressable>
              </View>
            </View>
            <View style={[styles.rowBetween, styles.topBorder]}> 
              <Text style={styles.muted}>⏰ Next: {item.nextDose}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
                <Text style={styles.muted}>Reminder</Text>
                <Switch value={item.reminder} onValueChange={(v) => setItems(prev => prev.map(m => m.id === item.id ? {...m, reminder: v} : m))} />
              </View>
            </View>
          </View>
        )}
      />

      <View style={{padding: 16}}>
        <Pressable style={styles.primaryBtn} onPress={() => setItems(prev => [...prev, {id: Date.now(), name: 'New Med', dosage: '100mg', frequency: 'Once daily', nextDose: '9:00 AM', reminder: true}])}>
          <Text style={styles.primaryBtnText}>＋ Add Medication</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
  back: {color: 'white', fontSize: 26, paddingRight: 12},
  headerTitle: {color: 'white', fontSize: 20, fontWeight: '700'},
  headerSub: {color: 'white', opacity: 0.9, backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingBottom: 12},
  outlineBtn: {height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white'},
  outlineText: {color: '#374151', fontWeight: '600'},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 14, marginHorizontal: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 2}},
  rowBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
  pillIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: '#eef2ff', alignItems: 'center', justifyContent: 'center'},
  name: {fontWeight: '600', fontSize: 16, color: '#111827'},
  muted: {color: '#6b7280', fontSize: 12},
  iconBtn: {height: 36, width: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
  topBorder: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb', paddingTop: 10, marginTop: 8},
  primaryBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5'},
  primaryBtnText: {color: 'white', fontWeight: '600'},
});

