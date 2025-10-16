import React, {useMemo} from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {RouteName, useRouter} from '../navigation/SimpleRouter';
import {useTheme} from '../state/ThemeContext';

type Tab = { key: RouteName; label: string; emoji: string };

const tabs: Tab[] = [
  {key: 'Dashboard', label: 'Home', emoji: '🏠'},
  {key: 'Symptoms', label: 'Symptoms', emoji: '📈'},
  {key: 'Medications', label: 'Meds', emoji: '💊'},
  {key: 'Profile', label: 'Profile', emoji: '👤'},
];

export default function BottomNav() {
  const {route, navigate} = useRouter();
  const {colors} = useTheme();
  const themedStyles = useMemo(
    () => ({
      container: [
        styles.container,
        {backgroundColor: colors.navBackground, borderTopColor: colors.navBorder},
      ],
      label: {color: colors.muted},
      active: {color: colors.text},
    }),
    [colors],
  );

  return (
    <View style={themedStyles.container}>
      {tabs.map(t => {
        const active = route === t.key;
        return (
          <Pressable
            key={t.key}
            onPress={() => navigate(t.key)}
            style={styles.item}
          >
            <Text style={[styles.emoji, themedStyles.label, active && themedStyles.active]}>{t.emoji}</Text>
            <Text style={[styles.label, themedStyles.label, active && themedStyles.active]}>{t.label}</Text>
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
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  active: {
    fontWeight: '600',
  },
});
