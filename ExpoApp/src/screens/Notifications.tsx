import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, Pressable, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {useNotifications, Kind} from '../state/NotificationsContext';

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

  const filtered = useMemo(() => (active === 'all' ? items : items.filter(i => i.kind === active)), [active, items]);

  const iconFor = (k: Kind) => (k === 'reminder' ? '⏰' : k === 'message' ? '✉️' : '⚠️');
  const pillColor = (k: Kind) => (k === 'reminder' ? '#22c55e20' : k === 'message' ? '#06b6d420' : '#f59e0b20');
  const pillText = (k: Kind) => (k === 'reminder' ? '#166534' : k === 'message' ? '#0e7490' : '#92400e');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.close}>Close ✕</Text>
        </Pressable>
      </View>
      <View style={styles.headerActions}>
        <Pressable onPress={markAllRead}><Text style={styles.markAllLink}>Mark all as read</Text></Pressable>
      </View>

      <View style={styles.tabsRow}>
        {tabs.map(t => (
          <Pressable key={t.key} style={[styles.tab, active===t.key && styles.tabActive]} onPress={() => setActive(t.key)}>
            <Text style={[styles.tabText, active===t.key && styles.tabTextActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        contentContainerStyle={{padding: 16, paddingBottom: 120}}
        data={filtered}
        keyExtractor={i => String(i.id)}
        renderItem={({item}) => (
          <View style={[styles.card, !item.read && styles.unread]}> 
            <View style={styles.rowBetween}>
              <View style={styles.rowLeft}>
                <View style={[styles.kindPill, {backgroundColor: pillColor(item.kind)}]}>
                  <Text style={{color: pillText(item.kind)}}>{iconFor(item.kind)}</Text>
                </View>
                <View style={{flex:1}}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
                </View>
              </View>
              <View style={{alignItems:'flex-end', gap:6}}>
                <Text style={styles.time}>{item.time}</Text>
                <View style={{flexDirection:'row', gap:8}}>
                  {!item.read && (
                    <Pressable onPress={() => markRead(item.id)}>
                      <Text style={styles.actionLink}>Mark read</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => deleteItem(item.id)}>
                    <Text style={[styles.actionLink, {color:'#b91c1c'}]}>Delete</Text>
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

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 12},
  headerTitle: {color: 'white', fontSize: 18, fontWeight: '700'},
  close: {color: 'white', fontWeight: '700'},
  headerActions: {paddingHorizontal: 16, paddingTop: 10},
  markAllLink: {color: '#4f46e5', fontWeight: '600'},
  tabsRow: {flexDirection: 'row', backgroundColor: 'white', margin: 16, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb'},
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center', height: 40},
  tabActive: {backgroundColor: '#eef2ff'},
  tabText: {color: '#6b7280', fontWeight: '600'},
  tabTextActive: {color: '#4f46e5'},
  card: {backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: {width: 0, height: 2}},
  unread: {borderWidth: 1, borderColor: '#c7d2fe'},
  rowBetween: {flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between'},
  rowLeft: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, flex: 1, paddingRight: 10},
  kindPill: {width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  title: {color: '#111827', fontWeight: '600'},
  body: {color: '#6b7280', fontSize: 12, marginTop: 2},
  time: {color: '#6b7280', fontSize: 12},
  actionLink: {color: '#4f46e5', fontSize: 12, fontWeight: '600'},
});
