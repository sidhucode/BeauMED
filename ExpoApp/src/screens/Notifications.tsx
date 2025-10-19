import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useNotifications, Kind} from '../state/NotificationsContext';
import {useTheme, ThemeColors, ThemeName} from '../state/ThemeContext';

const tabs: Array<{key: 'all' | Kind; label: string}> = [
  {key: 'all', label: 'All'},
  {key: 'reminder', label: 'Reminders'},
  {key: 'message', label: 'Messages'},
  {key: 'alert', label: 'Alerts'},
];

export default function NotificationsScreen() {
  const {navigate} = useRouter();
  const [active, setActive] = useState<'all' | Kind>('all');
  const {items, markAllRead, deleteItem, markRead} = useNotifications();
  const {colors, theme} = useTheme();
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const filtered = useMemo(
    () => (active === 'all' ? items : items.filter(item => item.kind === active)),
    [active, items],
  );

  const iconFor = (kind: Kind) => (kind === 'reminder' ? '⏰' : kind === 'message' ? '✉️' : '⚠️');
  const pillColor = (kind: Kind) =>
    kind === 'reminder'
      ? theme === 'dark'
        ? '#16653433'
        : '#22c55e20'
      : kind === 'message'
      ? theme === 'dark'
        ? '#0e749033'
        : '#06b6d420'
      : theme === 'dark'
      ? '#92400e33'
      : '#f59e0b20';
  const pillText = (kind: Kind) => (kind === 'reminder' ? '#22c55e' : kind === 'message' ? '#0ea5e9' : '#f59e0b');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.close}>Close ✕</Text>
        </Pressable>
      </View>
      <View style={styles.headerActions}>
        <Pressable onPress={markAllRead}>
          <Text style={styles.markAllLink}>Mark all as read</Text>
        </Pressable>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, active === tab.key && styles.tabActive]}
            onPress={() => setActive(tab.key)}
          >
            <Text style={[styles.tabText, active === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={[styles.card, !item.read && styles.unread]}>
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <View style={[styles.kindPill, {backgroundColor: pillColor(item.kind)}]}>
                  <Text style={{color: pillText(item.kind)}}>{iconFor(item.kind)}</Text>
                </View>
                <View style={styles.messageContainer}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
                </View>
              </View>
              <View style={styles.itemActions}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={styles.actionRow}>
                  {!item.read && (
                    <Pressable onPress={() => markRead(item.id)}>
                      <Text style={styles.actionLink}>Mark read</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => deleteItem(item.id)}>
                    <Text style={[styles.actionLink, styles.deleteLink]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors, theme: ThemeName) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerTitle: {color: colors.headerText, fontSize: 18, fontWeight: '700'},
    close: {color: colors.headerText, fontWeight: '700'},
    headerActions: {paddingHorizontal: 16, paddingTop: 10},
    markAllLink: {color: colors.primary, fontWeight: '600'},
    tabsRow: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      margin: 16,
      borderRadius: 10,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    tab: {flex: 1, alignItems: 'center', justifyContent: 'center', height: 40},
    tabActive: {backgroundColor: theme === 'dark' ? colors.accent : '#eef2ff'},
    tabText: {color: colors.muted, fontWeight: '600'},
    tabTextActive: {color: colors.primary},
    listContent: {padding: 16, paddingBottom: 120},
    card: {
      backgroundColor: colors.card,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    unread: {borderColor: colors.primary, borderWidth: 1},
    rowBetween: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
    rowLeft: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, paddingRight: 10},
    kindPill: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
    messageContainer: {flex: 1},
    title: {color: colors.text, fontWeight: '600'},
    body: {color: colors.muted, fontSize: 12, marginTop: 2},
    itemActions: {alignItems: 'flex-end', gap: 6},
    time: {color: colors.muted, fontSize: 12},
    actionRow: {flexDirection: 'row', gap: 8},
    actionLink: {color: colors.primary, fontSize: 12, fontWeight: '600'},
    deleteLink: {color: '#b91c1c'},
  });
