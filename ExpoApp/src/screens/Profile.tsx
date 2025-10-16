import React, {useMemo} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Switch, Pressable, ScrollView} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useProfile} from '../state/ProfileContext';
import {useTheme, ThemeColors, ThemeName} from '../state/ThemeContext';

export default function ProfileScreen() {
  const {navigate} = useRouter();
  const {profile} = useProfile();
  const {colors, theme, setTheme} = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <Text style={styles.headerTitle}>Profile & Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}><Text style={styles.avatarIcon}>👤</Text></View>
          <View style={styles.profileDetails}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileEmail}>{profile.email}</Text>
          </View>
          <Pressable style={styles.editButton} onPress={() => navigate('ProfileEdit')}>
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Personal Information</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.readOnlyInput} value={profile.name} editable={false} />
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.readOnlyInput} value={profile.age} editable={false} />
          <Text style={styles.label}>Chronic Conditions</Text>
          <TextInput
            style={[styles.readOnlyInput, styles.readOnlyMultiline]}
            value={profile.conditions}
            editable={false}
            multiline
          />
        </View>

        <Text style={styles.sectionLabel}>Emergency Contact</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Caregiver Name</Text>
          <TextInput style={styles.readOnlyInput} value={profile.caregiverName} editable={false} />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.readOnlyInput} value={profile.caregiverPhone} editable={false} />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.readOnlyInput}
            value={profile.caregiverEmail}
            editable={false}
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.sectionLabel}>App Settings</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Switch
              value
              trackColor={{false: '#d1d5db', true: colors.primary}}
              thumbColor={colors.primaryText}
            />
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.rowTitle}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={value => setTheme(value ? 'dark' : 'light')}
              trackColor={{false: '#d1d5db', true: colors.primary}}
              thumbColor={isDark ? colors.primaryText : '#ffffff'}
            />
          </View>
        </View>

        <Pressable style={styles.dangerBtn} onPress={() => navigate('Auth')}>
          <Text style={styles.dangerText}>⎋ Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, theme: ThemeName) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {backgroundColor: colors.headerBackground, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8},
    back: {color: colors.headerText, fontSize: 26, paddingRight: 12},
    headerTitle: {color: colors.headerText, fontSize: 20, fontWeight: '700'},
    scrollContent: {padding: 16, paddingBottom: 120},
    profileCard: {
      backgroundColor: colors.contrastCard,
      marginTop: 12,
      marginHorizontal: 0,
      padding: 14,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    avatar: {width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center'},
    avatarIcon: {color: colors.primaryText, fontSize: 24},
    profileDetails: {flex: 1},
    profileName: {color: colors.primaryText, fontWeight: '600', fontSize: 16},
    profileEmail: {color: colors.primaryText, opacity: 0.8, fontSize: 12},
    editButton: {paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)'},
    editButtonText: {color: colors.primaryText},
    sectionLabel: {marginTop: 16, color: colors.muted, fontWeight: '700', fontSize: 12, textTransform: 'uppercase'},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginTop: 8,
      gap: 8,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    label: {color: colors.muted, fontWeight: '600'},
    readOnlyInput: {
      height: 44,
      borderRadius: 10,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
      paddingHorizontal: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    readOnlyMultiline: {height: 80, textAlignVertical: 'top', paddingTop: 10},
    rowBetween: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6},
    rowTitle: {color: colors.text, fontWeight: '500'},
    dangerBtn: {height: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ef4444', marginTop: 16},
    dangerText: {color: '#ffffff', fontWeight: '700'},
  });
