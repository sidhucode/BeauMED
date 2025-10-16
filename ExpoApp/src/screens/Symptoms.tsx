import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, ScrollView} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useTheme, ThemeColors, ThemeName} from '../state/ThemeContext';

const commonSymptoms = ['Headache', 'Fatigue', 'Fever', 'Cough', 'Nausea', 'Dizziness', 'Shortness of breath', 'Chest pain'];

export default function SymptomsScreen() {
  const {navigate} = useRouter();
  const {colors, theme} = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ai, setAi] = useState('');
  const [severity, setSeverity] = useState<number | undefined>();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [primarySymptom, setPrimarySymptom] = useState('');

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom],
    );
    setPrimarySymptom(symptom);
  };

  const analyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setAi(
        'Based on your symptoms, I recommend:\n\n' +
          '• Rest and stay hydrated\n' +
          '• Monitor your temperature\n' +
          '• If symptoms persist for more than 48 hours, contact your doctor\n\n' +
          "Your symptoms don't indicate an emergency, but it's important to rest.",
      );
      setIsAnalyzing(false);
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Symptom Tracker</Text>
      </View>
      <Text style={styles.headerSub}>Log your symptoms and get AI recommendations</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Common Symptoms</Text>
        <View style={styles.chips}>
          {commonSymptoms.map(symptom => {
            const active = selectedSymptoms.includes(symptom);
            return (
              <Pressable
                key={symptom}
                onPress={() => toggleSymptom(symptom)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{symptom}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Primary Symptom</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Headache"
            placeholderTextColor={colors.muted}
            value={primarySymptom}
            onChangeText={setPrimarySymptom}
          />

          <Text style={[styles.label, styles.spacing]}>Severity (1-10)</Text>
          <View style={styles.severityRow}>
            {Array.from({length: 10}, (_, i) => i + 1).map(n => (
              <Pressable
                key={n}
                onPress={() => setSeverity(n)}
                style={[styles.severityChip, severity === n && styles.severityChipActive]}
              >
                <Text style={[styles.severityText, severity === n && styles.severityTextActive]}>{n}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, styles.spacing]}>Duration</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 2 hours"
            placeholderTextColor={colors.muted}
          />

          <Text style={[styles.label, styles.spacing]}>Additional Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Describe your symptoms in detail..."
            placeholderTextColor={colors.muted}
            multiline
          />

          <Pressable style={[styles.outlineBtn, styles.spacing]}>
            <Text style={styles.outlineText}>🎙️ Voice Input</Text>
          </Pressable>
        </View>

        <Pressable style={styles.primaryBtn} onPress={analyze} disabled={isAnalyzing}>
          <Text style={styles.primaryBtnText}>{isAnalyzing ? 'Analyzing...' : '✨ Get AI Recommendation'}</Text>
        </Pressable>

        {ai ? (
          <View style={styles.aiCard}>
            <View style={styles.aiHeader}>
              <View style={styles.spark}>
                <Text style={styles.sparkIcon}>✨</Text>
              </View>
              <Text style={styles.aiTitle}>AI Recommendation</Text>
            </View>
            <Text style={styles.aiText}>{ai}</Text>
            <Pressable style={[styles.outlineBtn, styles.spacing]}>
              <Text style={styles.outlineText}>Contact Doctor</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, theme: ThemeName) =>
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
    scrollContent: {padding: 16, paddingBottom: 120},
    label: {color: colors.text, marginBottom: 8},
    spacing: {marginTop: 10},
    chips: {flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10},
    chip: {
      paddingHorizontal: 14,
      height: 34,
      borderRadius: 18,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {backgroundColor: colors.accent, borderColor: colors.primary},
    chipText: {color: colors.text, fontSize: 12},
    chipTextActive: {color: colors.primary, fontWeight: '600'},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      gap: 8,
      marginTop: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    input: {
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      paddingHorizontal: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      color: colors.inputText,
    },
    notesInput: {height: 100, textAlignVertical: 'top'},
    severityRow: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
    severityChip: {
      width: 38,
      height: 38,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
    },
    severityChipActive: {backgroundColor: colors.accent, borderColor: colors.primary},
    severityText: {color: colors.text, fontSize: 14, fontWeight: '500'},
    severityTextActive: {color: colors.primary, fontWeight: '700'},
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
    primaryBtn: {
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      marginTop: 12,
    },
    primaryBtnText: {color: colors.primaryText, fontWeight: '700'},
    aiCard: {
      backgroundColor: theme === 'dark' ? colors.accent : '#f8fafc',
      borderRadius: 12,
      padding: 14,
      gap: 8,
      marginTop: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    aiHeader: {flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8},
    spark: {width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
    sparkIcon: {color: colors.primaryText},
    aiTitle: {fontWeight: '600', color: colors.text},
    aiText: {color: colors.text, fontSize: 13, lineHeight: 18},
  });

