import React from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Switch, Pressable, ScrollView} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

export default function ProfileScreen() {
  const {navigate} = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 120}}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={{color: 'white', fontSize: 24}}>👤</Text></View>
          <View style={{flex: 1}}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.muted}>john.doe@example.com</Text>
          </View>
          <Pressable style={styles.ghostBtn}><Text style={styles.ghostText}>Edit</Text></Pressable>
        </View>

        <Text style={styles.sectionLabel}>Personal Information</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} defaultValue="John Doe" />
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} defaultValue="45" keyboardType="number-pad" />
          <Text style={styles.label}>Chronic Conditions</Text>
          <TextInput style={styles.input} placeholder="e.g., Diabetes, Hypertension" />
        </View>

        <Text style={styles.sectionLabel}>Emergency Contact</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Caregiver Name</Text>
          <TextInput style={styles.input} placeholder="Enter name" />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} placeholder="(555) 123-4567" keyboardType="phone-pad" />
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="caregiver@example.com" autoCapitalize="none" />
        </View>

        <Text style={styles.sectionLabel}>App Settings</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}><Text style={styles.rowTitle}>Notifications</Text><Switch value /></View>
          <View style={styles.rowBetween}><Text style={styles.rowTitle}>Dark Mode</Text><Switch /></View>
          <View style={styles.rowBetween}><Text style={styles.rowTitle}>Data Sharing</Text><Switch /></View>
        </View>

        <Pressable style={styles.dangerBtn} onPress={() => navigate('Auth')}>
          <Text style={styles.dangerText}>⎋ Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
  back: {color: 'white', fontSize: 26, paddingRight: 12},
  headerTitle: {color: 'white', fontSize: 20, fontWeight: '700'},
  profileCard: {backgroundColor: '#4f46e5', marginTop: 12, marginHorizontal: 16, padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12},
  avatar: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center'},
  profileName: {color: 'white', fontWeight: '600', fontSize: 16},
  muted: {color: '#e5e7eb', fontSize: 12},
  ghostBtn: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)'},
  ghostText: {color: 'white'},
  sectionLabel: {marginTop: 16, marginHorizontal: 16, color: '#6b7280', fontWeight: '700', fontSize: 12, textTransform: 'uppercase'},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 14, marginHorizontal: 16, marginTop: 8, gap: 8},
  label: {color: '#374151'},
  input: {height: 44, borderRadius: 10, backgroundColor: '#f9fafb', paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb'},
  rowBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6},
  rowTitle: {color: '#111827', fontWeight: '500'},
  dangerBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', marginTop: 16, marginHorizontal: 16},
  dangerText: {color: 'white', fontWeight: '700'},
});

