import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Alert} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {signUp, signIn, signOut, getCurrentUser} from 'aws-amplify/auth';

export default function AuthScreen() {
  const {navigate} = useRouter();
  const [tab, setTab] = useState<'login'|'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setIsAuthenticated(true);
        navigate('Dashboard');
      }
    } catch (error) {
      // User not authenticated, stay on Auth screen
      console.log('User not authenticated');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !name || !phone) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name,
            phone_number: phone, // Add phone number (required by Cognito)
          },
        },
      });
      console.log('Sign Up Success:', result);
      Alert.alert('Success', 'Account created! If email verification is required, check your email to confirm. Then return to Sign In.');
      setTab('login');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
    } catch (error: any) {
      console.error('Sign Up Error:', error);
      Alert.alert('Sign Up Error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await signIn({
        username: email,
        password,
      });
      setIsAuthenticated(true);
      navigate('Dashboard');
    } catch (error: any) {
      console.error('Sign In Error Details:', error);
      console.error('Error Code:', error.code);
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      Alert.alert('Sign In Error', error.message || error.code || 'Failed to sign in. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (tab === 'login') {
      handleSignIn();
    } else {
      handleSignUp();
    }
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
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
            editable={!loading}
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
            value={name}
            onChangeText={setName}
            editable={!loading}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={styles.input} 
            placeholder="you@example.com" 
            keyboardType="email-address" 
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <Text style={styles.label}>Phone Number</Text>
          <TextInput 
            style={styles.input} 
            placeholder="+1 (555) 123-4567" 
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            editable={!loading}
          />
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            secureTextEntry 
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput 
            style={styles.input} 
            placeholder="••••••••" 
            secureTextEntry 
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />
          <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </Pressable>
        </View>
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
});
