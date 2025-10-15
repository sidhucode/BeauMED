import React from 'react';
import {SafeAreaView, ScrollView, View, Text, StyleSheet} from 'react-native';

export default function GenericScreen({title, subtitle}: {title: string; subtitle?: string}) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}> 
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.card}>
          <Text style={styles.placeholder}>Design coming from Loveable UI</Text>
          <Text style={styles.placeholderSmall}>Ported placeholder screen</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  content: {padding: 16, paddingBottom: 120},
  header: {marginBottom: 12},
  title: {fontSize: 22, fontWeight: '700', color: '#111827'},
  subtitle: {fontSize: 14, color: '#6b7280', marginTop: 4},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 16, elevation: 1},
  placeholder: {fontSize: 16, color: '#111827'},
  placeholderSmall: {fontSize: 12, color: '#6b7280', marginTop: 6},
});

