import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {RouteName, useRouter} from '../navigation/SimpleRouter';

type Tab = { key: RouteName; label: string; emoji: string };

const tabs: Tab[] = [
  {key: 'Dashboard', label: 'Home', emoji: '🏠'},
  {key: 'Symptoms', label: 'Symptoms', emoji: '📈'},
  {key: 'Medications', label: 'Meds', emoji: '💊'},
  {key: 'Profile', label: 'Profile', emoji: '👤'},
];

export default function BottomNav() {
  const {route, navigate} = useRouter();
  return (
    <View style={styles.container}>
      {tabs.map(t => {
        const active = route === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => navigate(t.key)}
            style={styles.item}
            android_ripple={{color: '#ddd'}}
          >
            <Text style={[styles.emoji, active && styles.active]}>{t.emoji}</Text>
            <Text style={[styles.label, active && styles.active]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e5e5',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 16,
    color: '#666',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  active: {
    color: '#111',
    fontWeight: '600',
  },
});

