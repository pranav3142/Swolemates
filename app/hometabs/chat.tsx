import React, { useEffect, useState,useLayoutEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,} from 'react-native';
import auth from '@react-native-firebase/auth';
import { supabase } from '../../utils/supabase';
import { useNavigation } from 'expo-router';

export default function ChatScreen() {
  const [mutuals, setMutuals] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const currentUser = auth().currentUser?.uid;

  const navigation = useNavigation();
  
    useLayoutEffect(() => {
      navigation.setOptions({
        title: 'Chat',
        headerStyle: {
          backgroundColor: '#25292e',
        },
        headerTintColor: '#fff',
      });
    }, [navigation]);

  useEffect(() => {
    fetchMutualFollows();
  }, []);

  const fetchMutualFollows = async () => {
    const { data: mutualData, error } = await supabase
      .from('mutual_follows')
      .select('user_b')
      .eq('user_a', currentUser);

    if (error) {
      console.error('Error fetching mutuals:', error.message);
      return;
    }

    const userIds = mutualData.map((row) => row.user_b);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username')
      .in('id', userIds);

    setMutuals(profiles || []);
  };

  const fetchMessages = async (otherUserId: string) => {
    setSelectedUser(otherUserId);

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${currentUser},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser})`
      )
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error.message);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUser,
      receiver_id: selectedUser,
      message: newMessage,
      timestamp: new Date(),
    });

    if (error) {
      console.error('Send error:', error.message);
      return;
    }

    setNewMessage('');
    fetchMessages(selectedUser); // Refresh
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={80}
    >
      {!selectedUser ? (
        <>
          <Text style={styles.title}>Mutual Buddies</Text>
          <FlatList
            data={mutuals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.userCard}
                onPress={() => fetchMessages(item.id)}
              >
                <Text style={styles.userText}>{item.username}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => setSelectedUser(null)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>

          <FlatList
            data={messages}
            keyExtractor={(item, idx) => idx.toString()}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.sender_id === currentUser
                    ? styles.myMessage
                    : styles.theirMessage,
                ]}
              >
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity onPress={sendMessage}>
              <Text style={styles.sendButton}>Send</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#25292e', padding: 16 },
  title: { color: '#ffd33d', fontSize: 24, marginBottom: 12, fontWeight: 'bold' },
  userCard: {
    backgroundColor: '#333',
    padding: 12,
    marginVertical: 6,
    borderRadius: 8,
  },
  userText: { color: '#fff', fontSize: 16 },
  backButton: { color: '#ffd33d', marginBottom: 12, fontSize: 16 },
  messageList: { paddingBottom: 20 },
  messageBubble: {
    padding: 10,
    marginVertical: 4,
    borderRadius: 10,
    maxWidth: '75%',
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#ffd33d',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
  },
  messageText: {
    color: '#000',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
    marginBottom: 50,
  },
  input: {
    flex: 1,
    backgroundColor: '#2c2c2e',
    color: 'white',
    padding: 12,
    borderRadius: 8,
  },
  sendButton: {
    color: '#ffd33d',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
