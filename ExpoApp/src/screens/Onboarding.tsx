import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

const slides = [
  { icon: '❤', title: 'Welcome to BeauMED', description: 'Your personal health companion, powered by AI to keep you healthy and informed.', color: '#4f46e5' },
  { icon: '💊', title: 'Track Your Health', description: 'Manage medications, log symptoms, and sync with wearables.', color: '#22c55e' },
  { icon: '📈', title: 'AI Recommendations', description: 'Get personalized insights and recommendations.', color: '#06b6d4' },
  { icon: '🗓️', title: 'Stay Connected', description: 'Find doctors, manage appointments, and connect with care.', color: '#f59e0b' },
];

export default function OnboardingScreen() {
  const {navigate} = useRouter();
  const [index, setIndex] = useState(0);
  const next = () => {
    if (index < slides.length - 1) setIndex(index + 1);
    else navigate('Auth');
  };
  const skip = () => navigate('Auth');

  const s = slides[index];
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}> 
        <View style={[styles.iconCircle, {backgroundColor: s.color + '20'}]}> 
          <Text style={[styles.icon, {color: s.color}]}>{s.icon}</Text>
        </View>
        <Text style={styles.title}>{s.title}</Text>
        <Text style={styles.desc}>{s.description}</Text>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <Pressable key={i} onPress={() => setIndex(i)} style={[styles.dot, i===index && styles.dotActive]} />
          ))}
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={next}>
          <Text style={styles.primaryBtnText}>{index < slides.length - 1 ? 'Next' : 'Get Started'} ›</Text>
        </Pressable>
        <Pressable style={styles.ghostBtn} onPress={skip}>
          <Text style={styles.ghostBtnText}>Skip</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24},
  iconCircle: {width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center', marginBottom: 24},
  icon: {fontSize: 56},
  title: {fontSize: 26, fontWeight: '700', color: '#111827', textAlign: 'center'},
  desc: {fontSize: 16, color: '#6b7280', textAlign: 'center', marginTop: 8},
  dots: {flexDirection: 'row', gap: 8, marginTop: 16},
  dot: {width: 10, height: 10, borderRadius: 5, backgroundColor: '#e5e7eb'},
  dotActive: {width: 20, backgroundColor: '#4f46e5'},
  actions: {padding: 20},
  primaryBtn: {backgroundColor: '#4f46e5', borderRadius: 10, height: 48, alignItems: 'center', justifyContent: 'center'},
  primaryBtnText: {color: 'white', fontWeight: '600', fontSize: 16},
  ghostBtn: {marginTop: 8, height: 44, alignItems: 'center', justifyContent: 'center'},
  ghostBtnText: {color: '#374151'},
});

