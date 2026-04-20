import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView
} from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';

const CITY_LABELS = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'];
const ACTIVITY_LABELS = ['Кино', 'Путешествия', 'Животные', 'Прогулки', 'Книги'];
const MUSIC_GENRE_LABELS = ['Хип-хоп', 'Поп', 'Рок', 'Джаз'];
const MUSIC_TRACK_LABELS = ['OG Buda', 'Boulevard Depo'];
const SPORT_LABELS = ['Футбол', 'Баскетбол', 'Бокс', 'Бег', 'Йога', 'Теннис'];

const SEGMENTS = [
  { key: 'recommended', label: 'Рекомендованные' },
  { key: 'filters', label: 'По сходству' }
];

function Chip({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ResultCard({ item, onOpenProfile, onWrite }) {
  const tags = [
    ...(item.interests || []).slice(0, 2),
    ...(item.tracks || []).slice(0, 2)
  ].slice(0, 4);

  const title = `${item.name}${item.age != null ? `, ${item.age}` : ''}`;
  const similarity = typeof item.similarityPercent === 'number' ? item.similarityPercent : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <TouchableOpacity
          style={styles.avatarBox}
          onPress={onOpenProfile}
          activeOpacity={0.8}
        >
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{item.name[0]}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.cardMain}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {title}
          </Text>

          {similarity != null ? (
            <Text style={styles.similarityText}>Сходство: {similarity}%</Text>
          ) : null}

          {item.quote ? (
            <Text style={styles.quotePreview} numberOfLines={2}>
              {item.quote}
            </Text>
          ) : null}

          {tags.length ? (
            <View style={styles.tagsRow}>
              {tags.map((t, idx) => (
                <View key={`${item.id}-t-${idx}`} style={styles.tag}>
                  <Text style={styles.tagText} numberOfLines={1}>
                    {t}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          {Array.isArray(item.commonInterests) && item.commonInterests.length > 0 ? (
            <Text style={styles.commonInterestsText} numberOfLines={1}>
              Общие интересы: {item.commonInterests.join(', ')}
            </Text>
          ) : null}
        </View>
      </View>

      <TouchableOpacity style={styles.writeBtn} onPress={onWrite} activeOpacity={0.85}>
        <Text style={styles.writeBtnText}>Написать</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function SearchScreen() {
  const router = useRouter();
  const ready = useRequireAuth();

  const [segment, setSegment] = useState('recommended');

  const [textQuery, setTextQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggle = useCallback((label, type) => {
    if (type === 'tracks') {
      setSelectedTracks(prev =>
        prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
      );
      return;
    }
    setSelectedInterests(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label]
    );
  }, []);

  const loadUsers = useCallback(
    async payload => {
      setLoading(true);
      setError('');
      try {
        const list = await api.searchUsers(payload);
        setUsers(Array.isArray(list) ? list : []);
      } catch (e) {
        if (e.code === 'UNAUTHORIZED') router.replace('/login');
        setError(e.message || 'Ошибка поиска');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await api.searchRecommendations();
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') router.replace('/login');
      setError(e.message || 'Ошибка рекомендаций');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!ready) return;
    if (segment === 'recommended') {
      loadRecommendations();
    }
  }, [ready, segment, loadRecommendations]);

  useEffect(() => {
    if (!ready || segment !== 'filters') return;
    loadUsers({
      text: textQuery,
      interests: selectedInterests,
      tracks: selectedTracks
    });
  }, [ready, segment, textQuery, selectedInterests, selectedTracks, loadUsers]);

  const onFind = () => {
    loadUsers({
      text: textQuery,
      interests: selectedInterests,
      tracks: selectedTracks
    });
  };

  const onAnonymousMatch = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.anonymousMatch({
        interests: selectedInterests,
        tracks: selectedTracks
      });
      if (!data?.chatId) throw new Error('Не удалось подобрать собеседника');
      router.push(`/chat/${data.chatId}`);
    } catch (e) {
      setError(e.message || 'Не удалось подобрать анонимного собеседника');
    } finally {
      setLoading(false);
    }
  };

  const openProfile = userId => router.push(`/profile/${userId}`);

  const onWrite = async userId => {
    try {
      const chat = await api.createChat(userId, false);
      if (!chat?.id) throw new Error('Чат не создан');
      router.push(`/chat/${chat.id}`);
    } catch (e) {
      Alert.alert('Ошибка', e.message || 'Не удалось создать чат');
    }
  };

  const filterGroups = useMemo(
    () => [
      { title: 'Города', type: 'interests', labels: CITY_LABELS },
      { title: 'Занятия', type: 'interests', labels: ACTIVITY_LABELS },
      { title: 'Музыка (жанры)', type: 'interests', labels: MUSIC_GENRE_LABELS },
      { title: 'Музыка (артисты/треки)', type: 'tracks', labels: MUSIC_TRACK_LABELS },
      { title: 'Спорт', type: 'interests', labels: SPORT_LABELS }
    ],
    []
  );

  if (!ready) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
        <BottomTabs active="search" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Поиск собеседника</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.segmentContainer}>
        {SEGMENTS.map(s => {
          const active = s.key === segment;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.segment, active && styles.segmentActive]}
              onPress={() => setSegment(s.key)}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentLabel, active && styles.segmentLabelActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={users}
        keyExtractor={u => u.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {segment === 'filters' ? (
              <>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Поиск по описанию (цитата, интересы)..."
                  placeholderTextColor="#C0B0A3"
                  value={textQuery}
                  onChangeText={setTextQuery}
                  autoCapitalize="none"
                />

                <View style={styles.filtersWrap}>
                  {filterGroups.map(group => (
                    <View key={group.title} style={styles.group}>
                      <Text style={styles.groupTitle}>{group.title}</Text>
                      <View style={styles.chipsRow}>
                        {group.labels.map(label => {
                          const active =
                            group.type === 'tracks'
                              ? selectedTracks.includes(label)
                              : selectedInterests.includes(label);
                          return (
                            <Chip
                              key={`${group.title}-${label}`}
                              label={label}
                              active={active}
                              onPress={() => toggle(label, group.type)}
                            />
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.findBtn} onPress={onFind} activeOpacity={0.9}>
                  <Text style={styles.findBtnText}>Найти</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.findBtn, styles.anonBtn]}
                  onPress={onAnonymousMatch}
                  activeOpacity={0.9}
                >
                  <Text style={styles.anonBtnText}>Анонимный матч по сходству</Text>
                </TouchableOpacity>
              </>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            {loading ? (
              <View style={styles.centerRow}>
                <ActivityIndicator />
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => (
          <ResultCard
            item={item}
            onOpenProfile={() => openProfile(item.id)}
            onWrite={() => onWrite(item.id)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Ничего не найдено</Text>
            </View>
          ) : null
        }
      />

      <BottomTabs active="search" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF7F0'
  },
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
    marginBottom: 10,
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
    paddingBottom: 20
  },
  listHeader: {
    paddingTop: 8
  },
  searchInput: {
    height: 40,
    borderRadius: 16,
    backgroundColor: '#F2E3D7',
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#5A3D2A',
    marginBottom: 14
  },
  filtersWrap: {
    marginBottom: 12
  },
  group: {
    marginBottom: 12
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A49080',
    marginBottom: 8
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F2E3D7'
  },
  chipActive: {
    backgroundColor: '#F8C9A9'
  },
  chipText: {
    fontSize: 12,
    color: '#8A7465'
  },
  chipTextActive: {
    color: '#5A3D2A',
    fontWeight: '600'
  },
  findBtn: {
    alignSelf: 'center',
    backgroundColor: '#F8C9A9',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10
  },
  findBtnText: {
    fontWeight: '700',
    color: '#5A3D2A'
  },
  anonBtn: {
    backgroundColor: '#F2A66E'
  },
  anonBtnText: {
    fontWeight: '700',
    color: '#FFF'
  },
  errorText: {
    color: '#c44',
    textAlign: 'center',
    marginBottom: 10
  },
  centerRow: {
    paddingVertical: 16,
    alignItems: 'center'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF',
    padding: 12,
    marginBottom: 12
  },
  cardTop: {
    flexDirection: 'row'
  },
  avatarBox: {
    marginRight: 12,
    width: 64,
    height: 64
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholderText: {
    color: '#8A7465',
    fontWeight: '700'
  },
  cardMain: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  quotePreview: {
    marginTop: 6,
    fontSize: 12,
    color: '#8A7465'
  },
  similarityText: {
    marginTop: 4,
    fontSize: 11,
    color: '#A49080',
    fontWeight: '600'
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8
  },
  tag: {
    backgroundColor: '#F2E3D7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  tagText: {
    fontSize: 11,
    color: '#8A7465'
  },
  commonInterestsText: {
    marginTop: 8,
    fontSize: 11,
    color: '#8A7465'
  },
  writeBtn: {
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: '#F2A66E',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 18,
    minWidth: 110,
    alignItems: 'center',
    justifyContent: 'center'
  },
  writeBtnText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 12
  },
  empty: {
    paddingVertical: 32,
    alignItems: 'center'
  },
  emptyText: {
    color: '#A49080'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

