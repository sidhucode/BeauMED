import React from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

export default function NotFoundScreen() {
  const {navigate} = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}> 
        <Text style={styles.title}>404</Text>
        <Text style={styles.subtitle}>Oops! Page not found</Text>
        <Pressable style={styles.linkBtn} onPress={() => navigate('Dashboard')}>
          <Text style={styles.linkText}>Return to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f3f4f6'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 40, fontWeight: '800', color: '#111827'},
  subtitle: {fontSize: 18, color: '#4b5563', marginTop: 6},
  linkBtn: {marginTop: 12},
  linkText: {color: '#2563eb', textDecorationLine: 'underline'},
});

