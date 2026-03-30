import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '../components/BottomTabs';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { api } from '../lib/api';
import { useFocusEffect } from '@react-navigation/native';

export default function ChatsScreen() {
  const router = useRouter();
  const ready = useRequireAuth();
  const [filter, setFilter] = useState('all');
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const list = await api.getChats();
      setChats(Array.isArray(list) ? list : []);
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        router.replace('/login');
        return;
      }
      setError(e.message || 'Не удалось загрузить чаты');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      if (ready) load();
    }, [ready, load])
  );

  const filteredChats =
    filter === 'all'
      ? chats
      : chats.filter(c => c.unread);

  const renderChatItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarPlaceholderText}>
              {String(item.name || '?')[0]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeaderRow}>
          <Text style={styles.chatName}>
            {item.name}
            {item.age != null ? `, ${item.age}` : ''}
          </Text>
          <Text style={styles.chatTime}>{item.time}</Text>
        </View>
        <Text
          style={[
            styles.chatLastMessage,
            item.unread && styles.chatLastMessageUnread
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Чаты</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segment, filter === 'all' && styles.segmentActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.segmentLabel,
                filter === 'all' && styles.segmentLabelActive
              ]}
            >
              Все чаты
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segment,
              filter === 'unread' && styles.segmentActive
            ]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.segmentLabel,
                filter === 'unread' && styles.segmentLabelActive
              ]}
            >
              Непрочитанные
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={load}>
              <Text style={styles.retry}>Повторить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={item => item.id}
            renderItem={renderChatItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  load();
                }}
              />
            }
          />
        )}
      </View>

      <BottomTabs active="chats" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF7F0'
  },
  body: {
    flex: 1
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  errorText: { color: '#A49080', textAlign: 'center' },
  retry: { marginTop: 8, color: '#F2A66E', fontWeight: '600' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  segmentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 20,
    backgroundColor: '#F2E3D7',
    padding: 2
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 18,
    alignItems: 'center'
  },
  segmentActive: {
    backgroundColor: '#F8C9A9'
  },
  segmentLabel: {
    fontSize: 13,
    color: '#A49080'
  },
  segmentLabelActive: {
    color: '#5A3D2A',
    fontWeight: '600'
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8
  },
  chatItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5D9CF'
  },
  avatarWrapper: {
    marginRight: 12
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholderText: {
    color: '#8A7465',
    fontWeight: '600'
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center'
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  chatName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  chatTime: {
    fontSize: 11,
    color: '#B0A097'
  },
  chatLastMessage: {
    fontSize: 13,
    color: '#A49080'
  },
  chatLastMessageUnread: {
    fontWeight: '600',
    color: '#5A3D2A'
  }
});
