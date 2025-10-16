import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, KeyboardAvoidingView, Platform} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useProfile} from '../state/ProfileContext';
import {useTheme, ThemeColors} from '../state/ThemeContext';

export default function ProfileEditScreen() {
  const {goBack} = useRouter();
  const {profile, updateProfile} = useProfile();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [conditions, setConditions] = useState(profile.conditions);
  const [caregiverName, setCaregiverName] = useState(profile.caregiverName);
  const [caregiverPhone, setCaregiverPhone] = useState(profile.caregiverPhone);
  const [caregiverEmail, setCaregiverEmail] = useState(profile.caregiverEmail);

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your full name.');
      return;
    }
    if (!age.trim()) {
      Alert.alert('Age required', 'Please enter your age.');
      return;
    }
    updateProfile({
      name: name.trim(),
      age: age.trim(),
      conditions: conditions.trim(),
      caregiverName: caregiverName.trim(),
      caregiverPhone: caregiverPhone.trim(),
      caregiverEmail: caregiverEmail.trim(),
    });
    goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Personal Info</Text>
        <Pressable onPress={goBack}><Text style={styles.close}>Close ?•</Text></Pressable>
      </View>
      <KeyboardAvoidingView behavior={Platform.select({ios: 'padding', android: undefined})} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.field}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              autoCapitalize="words"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="45"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Chronic Conditions</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={conditions}
              onChangeText={setConditions}
              multiline
              placeholder="e.g., Diabetes, Hypertension"
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.sectionLabel}>Emergency Contact</Text>
            <Text style={styles.label}>Caregiver Name</Text>
            <TextInput
              style={styles.input}
              value={caregiverName}
              onChangeText={setCaregiverName}
              placeholder="Jane Doe"
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={caregiverPhone}
              onChangeText={setCaregiverPhone}
              keyboardType="phone-pad"
              placeholder="(555) 123-4567"
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={caregiverEmail}
              onChangeText={setCaregiverEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="caregiver@example.com"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Pressable style={styles.primaryBtn} onPress={save}>
          <Text style={styles.primaryText}>Save Changes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.headerBackground, paddingHorizontal: 16, paddingVertical: 12},
  headerTitle: {color: colors.headerText, fontSize: 18, fontWeight: '700'},
  close: {color: colors.headerText, fontWeight: '600'},
  content: {padding: 16, gap: 16},
  field: {gap: 6},
  label: {color: colors.muted, fontWeight: '600'},
  input: {height: 48, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, backgroundColor: colors.inputBackground, paddingHorizontal: 12, color: colors.inputText},
  multiline: {height: 100, textAlignVertical: 'top', paddingTop: 12},
  sectionLabel: {color: colors.muted, fontWeight: '700', fontSize: 12, textTransform: 'uppercase', marginBottom: 4},
  footer: {padding: 16},
  primaryBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary},
  primaryText: {color: colors.primaryText, fontWeight: '700', fontSize: 16},
});
