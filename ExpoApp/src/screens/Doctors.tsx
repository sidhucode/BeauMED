import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useTheme, ThemeColors} from '../state/ThemeContext';

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  address: string;
  phone: string;
};

const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    specialty: 'Family Medicine',
    rating: 4.8,
    distance: '1.2 miles',
    address: '123 Medical Center Dr, Suite 100',
    phone: '(555) 123-4567',
  },
  {
    id: 2,
    name: 'Dr. Michael Chen',
    specialty: 'Cardiology',
    rating: 4.9,
    distance: '2.5 miles',
    address: '456 Heart Health Blvd, Suite 200',
    phone: '(555) 234-5678',
  },
  {
    id: 3,
    name: 'Dr. Emily Rodriguez',
    specialty: 'Internal Medicine',
    rating: 4.7,
    distance: '3.1 miles',
    address: '789 Wellness Ave, Suite 300',
    phone: '(555) 345-6789',
  },
];

export default function DoctorsScreen() {
  const {navigate} = useRouter();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const filtered = INITIAL_DOCTORS.filter(doctor =>
    `${doctor.name} ${doctor.specialty}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Find Doctors</Text>
      </View>
      <Text style={styles.headerSub}>Discover quality healthcare providers near you</Text>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or specialty..."
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <Pressable style={styles.filterBtn}>
          <Text style={styles.filterText}>Filter</Text>
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muted}>{item.specialty}</Text>
              </View>
              <View style={styles.rating}>
                <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
              </View>
            </View>
            <View style={styles.cardDetails}>
              <Text style={styles.muted}>📍 {item.address}</Text>
              <Text style={styles.muted}>🧭 {item.distance} away</Text>
            </View>
            <View style={styles.actionsRow}>
              <Pressable style={[styles.outlineBtn, {flex: 1}]}>
                <Text style={styles.outlineText}>📞 Call</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, {flex: 1}]}>
                <Text style={styles.primaryBtnText}>🧭 Directions</Text>
              </Pressable>
            </View>
          </View>
        )}
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
    searchRow: {flexDirection: 'row', gap: 8, padding: 16},
    search: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 10,
      height: 44,
      paddingHorizontal: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.inputText,
    },
    filterBtn: {
      height: 44,
      paddingHorizontal: 14,
      backgroundColor: colors.card,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    filterText: {color: colors.text, fontWeight: '600'},
    listContent: {padding: 16, paddingBottom: 100},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    cardTop: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
    cardInfo: {flex: 1},
    name: {fontWeight: '600', fontSize: 16, color: colors.text},
    muted: {color: colors.muted, fontSize: 12},
    rating: {backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8},
    ratingText: {color: colors.text, fontWeight: '600'},
    cardDetails: {gap: 6, marginTop: 6},
    actionsRow: {flexDirection: 'row', gap: 8, marginTop: 10},
    outlineBtn: {
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    outlineText: {color: colors.text, fontWeight: '600'},
    primaryBtn: {
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryBtnText: {color: colors.primaryText, fontWeight: '600'},
  });

