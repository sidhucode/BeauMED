import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Keyboard, InputAccessoryView, Platform} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

export default function AuthScreen() {
  const {navigate} = useRouter();
  const [tab, setTab] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const accessoryId = 'auth-input-accessory';
  const isIOS = Platform.OS === 'ios';
  const accessory = isIOS ? accessoryId : undefined;

  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('Dashboard');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBrand}> 
        <View style={styles.logo}><Text style={styles.logoHeart}>❤</Text></View>
        <Text style={styles.brand}>BeauMED</Text>
        <Text style={styles.sub}>Your Health Companion</Text>
      </View>

      <View style={styles.tabsRow}>
        <Pressable onPress={() => setTab('login')} style={[styles.tab, tab==='login' && styles.tabActive]}>
          <Text style={[styles.tabText, tab==='login' && styles.tabTextActive]}>Log In</Text>
        </Pressable>
        <Pressable onPress={() => setTab('signup')} style={[styles.tab, tab==='signup' && styles.tabActive]}>
          <Text style={[styles.tabText, tab==='signup' && styles.tabTextActive]}>Sign Up</Text>
        </Pressable>
      </View>

      {tab === 'login' ? (
        <View style={styles.form}> 
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Pressable>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            secureTextEntry
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter verification code"
            keyboardType="number-pad"
            inputAccessoryViewID={accessory}
            returnKeyType="done"
          />
          <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </Pressable>
        </View>
      )}

      {isIOS && (
        <InputAccessoryView nativeID={accessoryId}>
          <View style={styles.accessory}>
            <Pressable style={styles.doneBtn} onPress={() => Keyboard.dismiss()}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f7f7fb'},
  headerBrand: {alignItems: 'center', marginTop: 24, marginBottom: 12},
  logo: {width: 64, height: 64, borderRadius: 32, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center'},
  logoHeart: {color: 'white', fontSize: 28},
  brand: {fontSize: 28, fontWeight: '700', color: '#111827', marginTop: 8},
  sub: {color: '#6b7280', marginTop: 2},
  tabsRow: {flexDirection: 'row', backgroundColor: '#e5e7eb', borderRadius: 10, overflow: 'hidden', marginTop: 16},
  tab: {flex: 1, paddingVertical: 10, alignItems: 'center'},
  tabActive: {backgroundColor: 'white'},
  tabText: {color: '#6b7280', fontWeight: '600'},
  tabTextActive: {color: '#111827'},
  form: {marginTop: 16},
  label: {color: '#374151', marginBottom: 6, marginTop: 10},
  input: {backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e5e7eb'},
  link: {color: '#4f46e5', marginVertical: 10},
  primaryBtn: {backgroundColor: '#4f46e5', borderRadius: 10, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8},
  primaryBtnText: {color: 'white', fontWeight: '600'},
  accessory: {backgroundColor: '#f9fafb', paddingHorizontal: 16, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#d1d5db', alignItems: 'flex-end'},
  doneBtn: {paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#4f46e5', borderRadius: 8},
  doneText: {color: 'white', fontWeight: '600'},
});
