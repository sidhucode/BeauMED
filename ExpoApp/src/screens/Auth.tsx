import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, Alert} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {signUp, signIn, signOut, getCurrentUser, resetPassword, confirmResetPassword, confirmSignUp, resendSignUpCode} from 'aws-amplify/auth';
import {useProfile} from '../state/ProfileContext';

export default function AuthScreen() {
  const {navigate} = useRouter();
  const {loadUserProfile} = useProfile();
  const [tab, setTab] = useState<'login'|'signup'|'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Password reset states
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'email'|'code'>('email');

  // Sign-up verification states
  const [signupCode, setSignupCode] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);

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

      // Check if user needs to verify email
      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        Alert.alert('Check Your Email', 'A verification code has been sent to your email address. Please enter it below to complete sign-up.');
        setNeedsVerification(true);
      } else {
        Alert.alert('Success', 'Account created successfully! You can now log in.');
        setTab('login');
      }
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

    console.log('🔐 Attempting sign in with:', email);
    setLoading(true);
    try {
      const result = await signIn({
        username: email,
        password,
        options: {
          authFlowType: 'USER_PASSWORD_AUTH',
        },
      });
      console.log('✅ Sign in successful!', result);

      // Load user profile from Cognito
      await loadUserProfile();

      setIsAuthenticated(true);
      navigate('Dashboard');
    } catch (error: any) {
      console.error('❌ Sign In Error Details:', error);
      console.error('Error Code:', error.code);
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Constructor:', error.constructor?.name);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Error Keys:', Object.keys(error));
      console.error('Error Stack:', error.stack);
      Alert.alert('Sign In Error', error.message || error.code || 'Failed to sign in. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignUp = async () => {
    if (!signupCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: signupCode,
      });
      console.log('✅ Email verified successfully');
      Alert.alert('Success', 'Email verified! You can now log in with your account.');

      // Reset state and go to login
      setNeedsVerification(false);
      setSignupCode('');
      setTab('login');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setPhone('');
    } catch (error: any) {
      console.error('❌ Confirm Sign Up Error:', error);
      Alert.alert('Error', error.message || 'Failed to verify email. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendSignUpCode = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    setLoading(true);
    try {
      await resendSignUpCode({username: email});
      console.log('✅ Verification code resent');
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
    } catch (error: any) {
      console.error('❌ Resend Code Error:', error);
      Alert.alert('Error', error.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    console.log('🔄 Starting password reset for:', email);
    setLoading(true);
    try {
      const result = await resetPassword({username: email});
      console.log('✅ Password reset result:', result);
      console.log('✅ Password reset code sent to', email);
      console.log('🔄 Setting resetStep to "code"');
      setResetStep('code');
      console.log('✅ resetStep changed, should show code input now');
      Alert.alert('Check Your Email', 'A verification code has been sent to your email address.');
    } catch (error: any) {
      console.error('❌ Reset Password Error:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      Alert.alert('Error', error.message || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
      console.log('✅ Loading state set to false');
    }
  };

  const handleConfirmReset = async () => {
    if (!resetCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: resetCode,
        newPassword: newPassword,
      });
      console.log('✅ Password reset successful');
      Alert.alert('Success', 'Your password has been reset successfully! You can now log in with your new password.');

      // Reset state and go back to login
      setTab('login');
      setResetStep('email');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPassword('');
    } catch (error: any) {
      console.error('❌ Confirm Reset Error:', error);
      Alert.alert('Error', error.message || 'Failed to reset password. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (tab === 'login') {
      handleSignIn();
    } else if (tab === 'signup') {
      if (needsVerification) {
        handleConfirmSignUp();
      } else {
        handleSignUp();
      }
    } else if (tab === 'reset') {
      if (resetStep === 'email') {
        handleRequestReset();
      } else {
        handleConfirmReset();
      }
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

      {tab === 'reset' ? (
        <View style={styles.form}>
          {resetStep === 'email' ? (
            <>
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
              <Pressable onPress={() => setTab('login')}>
                <Text style={styles.link}>Back to Log In</Text>
              </Pressable>
              <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Sending code...' : 'Send Reset Code'}</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                value={resetCode}
                onChangeText={setResetCode}
                editable={!loading}
              />
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
              />
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
                editable={!loading}
              />
              <Pressable onPress={() => setResetStep('email')}>
                <Text style={styles.link}>Resend Code</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, {marginTop: 16}]} onPress={submit} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Resetting...' : 'Reset Password'}</Text>
              </Pressable>
            </>
          )}
        </View>
      ) : tab === 'login' ? (
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
          <Pressable onPress={() => { setTab('reset'); setResetStep('email'); }}>
            <Text style={styles.link}>Forgot password?</Text>
          </Pressable>
          <Pressable style={styles.primaryBtn} onPress={submit} disabled={loading}>
            <Text style={styles.primaryBtnText}>{loading ? 'Logging in...' : 'Log In'}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.form}>
          {needsVerification ? (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                value={signupCode}
                onChangeText={setSignupCode}
                editable={!loading}
              />
              <Pressable onPress={handleResendSignUpCode}>
                <Text style={styles.link}>Resend Code</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, {marginTop: 16}]} onPress={submit} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
              </Pressable>
            </>
          ) : (
            <>
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
              <Pressable style={[styles.primaryBtn, {marginTop: 32}]} onPress={submit} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
              </Pressable>
            </>
          )}
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
  form: {marginTop: 16, paddingHorizontal: 16},
  label: {color: '#374151', marginBottom: 6, marginTop: 10},
  input: {backgroundColor: 'white', borderRadius: 10, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: '#e5e7eb'},
  link: {color: '#4f46e5', marginVertical: 10},
  primaryBtn: {backgroundColor: '#4f46e5', borderRadius: 10, height: 48, alignItems: 'center', justifyContent: 'center', marginTop: 8},
  primaryBtnText: {color: 'white', fontWeight: '600'},
});
