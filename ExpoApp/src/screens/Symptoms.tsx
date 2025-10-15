import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, ScrollView} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

export default function SymptomsScreen() {
  const {navigate} = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ai, setAi] = useState('');
  const [severity, setSeverity] = useState<number|undefined>();

  const analyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAi(
        'Based on your symptoms, I recommend:\n\n' +
        '• Rest and stay hydrated\n' +
        '• Monitor your temperature\n' +
        '• If symptoms persist for more than 48 hours, contact your doctor\n\n' +
        "Your symptoms don't indicate an emergency, but it's important to rest."
      );
      setIsAnalyzing(false);
    }, 1200);
  };

  const common = ['Headache','Fatigue','Fever','Cough','Nausea','Dizziness','Shortness of breath','Chest pain'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Symptom Tracker</Text>
      </View>
      <Text style={styles.headerSub}>Log your symptoms and get AI recommendations</Text>

      <ScrollView contentContainerStyle={{padding: 16, paddingBottom: 120}}>
        <Text style={styles.label}>Common Symptoms</Text>
        <View style={styles.chips}>
          {common.map(s => (
            <Pressable key={s} style={styles.chip}><Text style={styles.chipText}>{s}</Text></Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Primary Symptom</Text>
          <TextInput style={styles.input} placeholder="e.g., Headache" />

          <Text style={[styles.label, {marginTop: 10}]}>Severity (1-10)</Text>
          <View style={styles.severityRow}>
            {Array.from({length: 10}).map((_, i) => i + 1).map(n => (
              <Pressable key={n} onPress={() => setSeverity(n)} style={[styles.sev, severity===n && styles.sevActive]}>
                <Text style={[styles.sevText, severity===n && styles.sevTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, {marginTop: 10}]}>Duration</Text>
          <TextInput style={styles.input} placeholder="e.g., 2 hours" />

          <Text style={[styles.label, {marginTop: 10}]}>Additional Notes</Text>
          <TextInput style={[styles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Describe your symptoms in detail..." multiline />

          <Pressable style={[styles.outlineBtn, {marginTop: 10}]}> 
            <Text style={styles.outlineText}>🎙️ Voice Input</Text>
          </Pressable>
        </View>

        <Pressable style={styles.primaryBtn} onPress={analyze} disabled={isAnalyzing}>
          <Text style={styles.primaryBtnText}>{isAnalyzing ? 'Analyzing...' : '✨ Get AI Recommendation'}</Text>
        </Pressable>

        {ai ? (
          <View style={[styles.card, {backgroundColor: '#f8fafc'}]}> 
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8}}>
              <View style={styles.spark}><Text style={{color: 'white'}}>✨</Text></View>
              <Text style={{fontWeight: '600'}}>AI Recommendation</Text>
            </View>
            <Text style={styles.aiText}>{ai}</Text>
            <Pressable style={[styles.outlineBtn, {marginTop: 10}]}> 
              <Text style={styles.outlineText}>Contact Doctor</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
  back: {color: 'white', fontSize: 26, paddingRight: 12},
  headerTitle: {color: 'white', fontSize: 20, fontWeight: '700'},
  headerSub: {color: 'white', opacity: 0.9, backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingBottom: 12},
  label: {color: '#374151', marginBottom: 8},
  chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10},
  chip: {paddingHorizontal: 12, height: 32, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white', alignItems: 'center', justifyContent: 'center'},
  chipText: {color: '#374151', fontSize: 12},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 14, gap: 8, marginTop: 10},
  input: {height: 44, borderRadius: 10, backgroundColor: '#f9fafb', paddingHorizontal: 12, borderWidth: 1, borderColor: '#e5e7eb'},
  severityRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 6},
  sev: {width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white'},
  sevActive: {backgroundColor: '#eef2ff', borderColor: '#c7d2fe'},
  sevText: {color: '#374151', fontSize: 12},
  sevTextActive: {color: '#4f46e5', fontWeight: '700'},
  outlineBtn: {height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: 'white'},
  outlineText: {color: '#374151', fontWeight: '600'},
  primaryBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', marginTop: 12},
  primaryBtnText: {color: 'white', fontWeight: '700'},
  spark: {width: 32, height: 32, borderRadius: 16, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center'},
  aiText: {color: '#334155', fontSize: 13, lineHeight: 18},
});
