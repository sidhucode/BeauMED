import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable, Switch, Alert, FlatList, ActivityIndicator} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useRouter} from '../navigation/SimpleRouter';
import {useMedications} from '../state/MedicationsContext';
import {useTheme, ThemeColors} from '../state/ThemeContext';
import {uploadPrescription} from '../utils/prescriptionUpload';

export default function MedicationsScreen() {
  const {navigate} = useRouter();
  const {items, loading, removeMedication, refreshMedications} = useMedications();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const scanPrescription = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Camera access is required to scan prescriptions.');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handlePrescriptionUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const selectPrescriptionFromLibrary = async () => {
    try {
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Photo library access is required to select prescriptions.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await handlePrescriptionUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handlePrescriptionUpload = async (imageUri: string) => {
    setUploading(true);
    try {
      const result = await uploadPrescription(
        imageUri,
        `prescription-${Date.now()}.jpg`,
        (stage) => setUploadProgress(stage)
      );

      Alert.alert(
        'Success!',
        `Found ${result.medications.length} medication(s) in your prescription. They have been added to your list.`,
        [
          {
            text: 'OK',
            onPress: () => refreshMedications(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to analyze prescription. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  };

  const showPrescriptionOptions = () => {
    Alert.alert(
      'Scan Prescription',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: scanPrescription,
        },
        {
          text: 'Choose from Library',
          onPress: selectPrescriptionFromLibrary,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Medications</Text>
      </View>
      <Text style={styles.headerSub}>Manage your prescriptions and reminders</Text>

      <View style={styles.scanWrap}>
        <Pressable
          style={[styles.outlineBtn, uploading && styles.outlineBtnDisabled]}
          onPress={showPrescriptionOptions}
          disabled={uploading}
        >
          {uploading ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.outlineText}>{uploadProgress}</Text>
            </View>
          ) : (
            <Text style={styles.outlineText}>📷 Scan Prescription</Text>
          )}
        </Pressable>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={items}
        keyExtractor={item => item.medicationId}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.cardLeft}>
                <View style={styles.pillIcon}>
                  <Text style={styles.pillEmoji}>💊</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.muted}>{item.dosage}</Text>
                  <Text style={styles.muted}>{item.frequency}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <Pressable style={styles.iconBtn} onPress={() => navigate('MedicationForm', {mode: 'edit', medicationId: item.medicationId})}>
                  <Text style={styles.iconText}>✏️</Text>
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => removeMedication(item.medicationId)}>
                  <Text style={styles.deleteText}>🗑️</Text>
                </Pressable>
              </View>
            </View>
            {item.reminders && item.reminders.length > 0 && (
              <View style={[styles.rowBetween, styles.topBorder]}>
                <Text style={styles.muted}>⏰ Reminders: {item.reminders.join(', ')}</Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable style={styles.primaryBtn} onPress={() => navigate('MedicationForm', {mode: 'add'})}>
              <Text style={styles.primaryBtnText}>＋ Add Medication</Text>
            </Pressable>
          </View>
        }
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
    scanWrap: {padding: 16, gap: 12},
    outlineBtn: {
      height: 44,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    outlineBtnDisabled: {
      opacity: 0.6,
    },
    outlineText: {color: colors.text, fontWeight: '600'},
    listContent: {paddingHorizontal: 16, paddingBottom: 120},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    rowBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'},
    cardLeft: {flexDirection: 'row', gap: 10, alignItems: 'center'},
    pillIcon: {width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center'},
    pillEmoji: {fontSize: 18},
    name: {fontWeight: '600', fontSize: 16, color: colors.text},
    muted: {color: colors.muted, fontSize: 12},
    cardActions: {flexDirection: 'row', gap: 6},
    iconBtn: {height: 36, width: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center'},
    iconText: {fontSize: 16, color: colors.text},
    deleteText: {color: '#b91c1c', fontSize: 16},
    topBorder: {borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 10, marginTop: 8},
    reminderRow: {flexDirection: 'row', alignItems: 'center', gap: 8},
    footer: {paddingVertical: 16},
    primaryBtn: {
      height: 48,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    primaryBtnText: {color: colors.primaryText, fontWeight: '600'},
  });

