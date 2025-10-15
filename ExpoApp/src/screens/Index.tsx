import React from 'react';
import {SafeAreaView, View, Text, StyleSheet} from 'react-native';

export default function IndexScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}> 
        <Text style={styles.title}>Welcome to Your Blank App</Text>
        <Text style={styles.subtitle}>Start building your amazing project here!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f3f4f6'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {fontSize: 24, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center'},
  subtitle: {fontSize: 16, color: '#6b7280', textAlign: 'center'},
});

