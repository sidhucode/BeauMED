import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

type Doctor = { id: number; name: string; specialty: string; rating: number; distance: string; address: string; phone: string };

export default function DoctorsScreen() {
  const {navigate} = useRouter();
  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Family Medicine', rating: 4.8, distance: '1.2 miles', address: '123 Medical Center Dr, Suite 100', phone: '(555) 123-4567' },
    { id: 2, name: 'Dr. Michael Chen', specialty: 'Cardiology', rating: 4.9, distance: '2.5 miles', address: '456 Heart Health Blvd, Suite 200', phone: '(555) 234-5678' },
    { id: 3, name: 'Dr. Emily Rodriguez', specialty: 'Internal Medicine', rating: 4.7, distance: '3.1 miles', address: '789 Wellness Ave, Suite 300', phone: '(555) 345-6789' },
  ]);

  const filtered = doctors.filter(d => [d.name, d.specialty].join(' ').toLowerCase().includes(query.toLowerCase()));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Find Doctors</Text>
      </View>
      <Text style={styles.headerSub}>Discover quality healthcare providers near you</Text>

      <View style={styles.searchRow}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search by name or specialty..." style={styles.search} />
        <Pressable style={styles.filterBtn}><Text style={styles.filterText}>Filter</Text></Pressable>
      </View>

      <FlatList
        contentContainerStyle={{padding: 16, paddingBottom: 100}}
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={{flex: 1}}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muted}>{item.specialty}</Text>
              </View>
              <View style={styles.rating}><Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text></View>
            </View>
            <View style={{gap: 6, marginTop: 6}}>
              <Text style={styles.muted}>📍 {item.address}</Text>
              <Text style={styles.muted}>🧭 {item.distance} away</Text>
            </View>
            <View style={styles.actionsRow}>
              <Pressable style={[styles.outlineBtn, {flex: 1}]}><Text style={styles.outlineText}>📞 Call</Text></Pressable>
              <Pressable style={[styles.primaryBtn, {flex: 1}]}><Text style={styles.primaryBtnText}>🧭 Directions</Text></Pressable>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
  back: {color: 'white', fontSize: 26, paddingRight: 12},
  headerTitle: {color: 'white', fontSize: 20, fontWeight: '700'},
  headerSub: {color: 'white', opacity: 0.9, backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingBottom: 12},
  searchRow: {flexDirection: 'row', gap: 8, padding: 16},
  search: {flex: 1, backgroundColor: 'white', borderRadius: 10, height: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb'},
  filterBtn: {height: 44, paddingHorizontal: 14, backgroundColor: 'white', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb'},
  filterText: {color: '#374151', fontWeight: '600'},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 2}},
  cardTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  name: {fontWeight: '600', fontSize: 16, color: '#111827'},
  muted: {color: '#6b7280', fontSize: 12},
  rating: {backgroundColor: '#f59e0b20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
  ratingText: {color: '#92400e', fontWeight: '600'},
  actionsRow: {flexDirection: 'row', gap: 8, marginTop: 10},
  outlineBtn: {height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white'},
  outlineText: {color: '#374151', fontWeight: '600'},
  primaryBtn: {height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5'},
  primaryBtnText: {color: 'white', fontWeight: '600'},
});

