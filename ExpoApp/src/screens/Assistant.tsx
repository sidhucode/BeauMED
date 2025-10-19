import React, {useMemo, useState} from 'react';
import {SafeAreaView, View, Text, StyleSheet, TextInput, Pressable, FlatList, ActivityIndicator} from 'react-native';
import {useRouter} from '../navigation/SimpleRouter';
import {get, post} from 'aws-amplify/api';
import {fetchAuthSession} from 'aws-amplify/auth';
import {useTheme, ThemeColors} from '../state/ThemeContext';

type Message = {id: number; role: 'user' | 'assistant'; content: string};

export default function AssistantScreen() {
  const {navigate} = useRouter();
  const {colors} = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        "Hello! I'm your AI health assistant. How can I help you today? You can ask me about your medications, symptoms, or general health questions.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage: Message = {id: messages.length + 1, role: 'user', content: text};
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const session = await fetchAuthSession();
      const token = session?.tokens?.idToken?.toString();

      const response = await post({
        apiName: 'beaumedApi',
        path: '/chat',
        options: {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: {message: text},
        },
      }).response;

      const result = await response.body.json();
      const aiContent =
        (result && typeof result === 'object' && 'response' in result && result.response) ||
        "I couldn't process that. Please try again.";

      const aiMessage: Message = {id: userMessage.id + 1, role: 'assistant', content: aiContent};
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: userMessage.id + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigate('Dashboard')}>
          <Text style={styles.back}>‹</Text>
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSub}>Powered by AI</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={messages}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => (
          <View style={[styles.bubbleWrap, item.role === 'user' ? styles.right : styles.left]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.message, item.role === 'user' && styles.userMessage]}>{item.content}</Text>
            </View>
          </View>
        )}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} color={colors.primary} /> : null}
      />

      <View style={styles.inputBar}>
        <Pressable style={styles.iconBtn}>
          <Text style={styles.iconText}>🎙️</Text>
        </Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor={colors.muted}
          onSubmitEditing={send}
          style={styles.input}
        />
        <Pressable style={styles.sendBtn} onPress={send}>
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {flex: 1, backgroundColor: colors.background},
    header: {
      backgroundColor: colors.headerBackground,
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    back: {color: colors.headerText, fontSize: 26, paddingRight: 12},
    headerTitle: {color: colors.headerText, fontSize: 20, fontWeight: '700'},
    headerSub: {color: colors.headerText, opacity: 0.85, fontSize: 12},
    listContent: {padding: 16, paddingBottom: 100, gap: 10},
    bubbleWrap: {width: '100%', marginVertical: 4},
    left: {alignItems: 'flex-start'},
    right: {alignItems: 'flex-end'},
    bubble: {maxWidth: '80%', borderRadius: 12, padding: 12},
    assistantBubble: {backgroundColor: colors.accent},
    userBubble: {backgroundColor: colors.primary},
    message: {color: colors.text, fontSize: 14},
    userMessage: {color: colors.primaryText},
    loader: {marginTop: 8},
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      marginBottom: 70,
    },
    iconBtn: {
      height: 40,
      width: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
    },
    iconText: {color: colors.text},
    sendBtn: {
      height: 40,
      width: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
    },
    sendIcon: {color: colors.primaryText},
    input: {
      flex: 1,
      height: 40,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 10,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
    },
  });
