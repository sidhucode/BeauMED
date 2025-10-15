import React, {useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';

type Message = { id: number; role: 'user' | 'assistant'; content: string };

export default function AssistantScreen() {
  const {navigate} = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {id: 1, role: 'assistant', content: "Hello! I'm your AI health assistant. How can I help you today? You can ask me about your medications, symptoms, or general health questions."},
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const user: Message = {id: messages.length + 1, role: 'user', content: text};
    setMessages(prev => [...prev, user]);
    setInput('');
    setTimeout(() => {
      const ai: Message = {id: user.id + 1, role: 'assistant', content: "I understand. If symptoms worsen or persist, contact your healthcare provider. Want me to help find a nearby doctor?"};
      setMessages(prev => [...prev, ai]);
    }, 800);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <Pressable onPress={() => navigate('Dashboard')}><Text style={styles.back}>‹</Text></Pressable>
        <View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSub}>Powered by AI</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={{padding: 16, paddingBottom: 100, gap: 10}}
        data={messages}
        keyExtractor={m => String(m.id)}
        renderItem={({item}) => (
          <View style={[styles.bubbleWrap, item.role === 'user' ? styles.right : styles.left]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.user : styles.assistant]}> 
              <Text style={[styles.message, item.role === 'user' && {color: 'white'}]}>{item.content}</Text>
            </View>
          </View>
        )}
      />

      <View style={styles.inputBar}>
        <Pressable style={styles.iconBtn}><Text>🎙️</Text></Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          onSubmitEditing={send}
          style={styles.input}
        />
        <Pressable style={styles.sendBtn} onPress={send}><Text style={{color: 'white'}}>➤</Text></Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f7f7fb'},
  header: {backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10},
  back: {color: 'white', fontSize: 26, paddingRight: 12},
  headerTitle: {color: 'white', fontSize: 20, fontWeight: '700'},
  headerSub: {color: 'white', opacity: 0.85, fontSize: 12},
  bubbleWrap: {width: '100%', marginVertical: 4},
  left: {alignItems: 'flex-start'},
  right: {alignItems: 'flex-end'},
  bubble: {maxWidth: '80%', borderRadius: 12, padding: 12},
  assistant: {backgroundColor: '#eef2ff'},
  user: {backgroundColor: '#4f46e5'},
  message: {color: '#111827', fontSize: 14},
  inputBar: {flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb', backgroundColor: 'white'},
  iconBtn: {height: 40, width: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6'},
  sendBtn: {height: 40, width: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5'},
  input: {flex: 1, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 10, backgroundColor: 'white'},
});

