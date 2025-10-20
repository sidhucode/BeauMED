import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator, Linking} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useTheme, ThemeColors} from '../state/ThemeContext';

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating?: number;
  distanceMiles?: number;
  address?: string;
  phone?: string | null;
  coordinate?: {lat: number; lng: number} | null;
  placeId: string;
};

const GOOGLE_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
const DEFAULT_CITY_QUERY = 'doctors in San Jose, California';
const DEFAULT_COORDINATE = {lat: 37.3382, lng: -121.8863};

const haversineMiles = (from: typeof DEFAULT_COORDINATE, to: {lat: number; lng: number}) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMiles * c;
};

const formatSpecialty = (types?: string[]) => {
  if (!types || types.length === 0) return 'Healthcare Provider';
  const primary = types.find(type => type !== 'point_of_interest' && type !== 'establishment') ?? types[0];
  return primary
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function DoctorsScreen() {
  const {navigate} = useRouter();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [query, setQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorDetails = useCallback(async (placeId: string) => {
    if (!GOOGLE_API_KEY) return null;
    try {
      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId,
      )}&fields=formatted_phone_number,website&key=${GOOGLE_API_KEY}`;
      const response = await fetch(detailsUrl);
      const data = await response.json();
      if (data.status !== 'OK') return null;
      return data.result?.formatted_phone_number ?? null;
    } catch {
      return null;
    }
  }, []);

  const fetchDoctors = useCallback(
    async (search: string) => {
      if (!GOOGLE_API_KEY) {
        setError('Google Maps API key is missing. Update EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in .env.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
          search,
        )}&key=${GOOGLE_API_KEY}&type=doctor`;
        const response = await fetch(textUrl);
        const data = await response.json();

        if (data.status !== 'OK') {
          setDoctors([]);
          setError(data.error_message || data.status || 'Failed to fetch doctors.');
          return;
        }

        const results = data.results.slice(0, 12);
        const enriched = await Promise.all(
          results.map(async (place: any) => {
            const coordinate = place.geometry?.location ?? null;
            const distanceMiles = coordinate ? haversineMiles(DEFAULT_COORDINATE, coordinate) : undefined;

            const phone = await fetchDoctorDetails(place.place_id);

            return {
              id: place.place_id,
              placeId: place.place_id,
              name: place.name,
              specialty: formatSpecialty(place.types),
              rating: place.rating,
              distanceMiles,
              address: place.formatted_address,
              phone,
              coordinate,
            } as Doctor;
          }),
        );

        setDoctors(enriched);
      } catch (err) {
        console.error(err);
        setError('Unable to load doctors right now. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [fetchDoctorDetails],
  );

  useEffect(() => {
    fetchDoctors(DEFAULT_CITY_QUERY);
  }, [fetchDoctors]);

  const handleSearch = useCallback(() => {
    const searchTerm = query.trim();
    fetchDoctors(searchTerm.length > 0 ? `doctors in ${searchTerm}` : DEFAULT_CITY_QUERY);
  }, [fetchDoctors, query]);

  const handleCall = useCallback((phone?: string | null) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`).catch(() => undefined);
  }, []);

  const handleDirections = useCallback((doctor: Doctor) => {
    const destination =
      doctor.address && doctor.address.length > 0
        ? encodeURIComponent(doctor.address)
        : doctor.coordinate
        ? `${doctor.coordinate.lat},${doctor.coordinate.lng}`
        : null;
    if (!destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    Linking.openURL(url).catch(() => undefined);
  }, []);

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
          placeholder="Search by city or specialty..."
          placeholderTextColor={colors.muted}
          style={styles.search}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.filterBtn} onPress={handleSearch}>
          <Text style={styles.filterText}>Search</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.feedback}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.feedbackText}>Fetching doctors…</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.feedback}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && doctors.length === 0 && (
        <View style={styles.feedback}>
          <Text style={styles.feedbackText}>No doctors found. Try a different city or specialty.</Text>
        </View>
      )}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={doctors}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.muted}>{item.specialty}</Text>
              </View>
              {typeof item.rating === 'number' && (
                <View style={styles.rating}>
                  <Text style={styles.ratingText}>★ {item.rating.toFixed(1)}</Text>
                </View>
              )}
            </View>
            <View style={styles.cardDetails}>
              {item.address ? <Text style={styles.muted}>📍 {item.address}</Text> : null}
              {item.distanceMiles !== undefined ? (
                <Text style={styles.muted}>🧭 {item.distanceMiles.toFixed(1)} miles away</Text>
              ) : null}
            </View>
            <View style={styles.actionsRow}>
              <Pressable
                style={[styles.outlineBtn, {flex: 1}, !item.phone && styles.disabledBtn]}
                onPress={() => handleCall(item.phone)}
                disabled={!item.phone}
              >
                <Text style={[styles.outlineText, !item.phone && styles.disabledText]}>
                  📞 {item.phone ? 'Call' : 'No Phone'}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, {flex: 1}, !item.address && !item.coordinate && styles.disabledBtn]}
                onPress={() => handleDirections(item)}
                disabled={!item.address && !item.coordinate}
              >
                <Text style={[styles.primaryBtnText, !item.address && !item.coordinate && styles.disabledText]}>
                  🧭 Directions
                </Text>
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
    feedback: {paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center'},
    feedbackText: {color: colors.muted},
    errorText: {color: '#ef4444', textAlign: 'center'},
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
    disabledBtn: {opacity: 0.5},
    disabledText: {color: colors.muted},
    primaryBtn: {
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryBtnText: {color: colors.primaryText, fontWeight: '600'},
  });
