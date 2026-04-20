import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useLayoutEffect
} from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';

const CITY_OPTIONS = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'];
const ACTIVITY_OPTIONS = ['Кино', 'Путешествия', 'Животные', 'Прогулки', 'Книги'];
const SPORT_OPTIONS = ['Футбол', 'Баскетбол', 'Бокс', 'Бег', 'Йога', 'Теннис'];
const MUSIC_GENRES = ['Хип-хоп', 'Поп', 'Рок', 'Джаз'];

const AVATAR_PRESETS = [
  'https://i.pravatar.cc/200?img=12',
  'https://i.pravatar.cc/200?img=32',
  'https://i.pravatar.cc/200?img=15',
  'https://i.pravatar.cc/200?img=24'
];

function buildMePayload({
  displayName,
  age,
  avatar,
  quote,
  cities,
  activities,
  sports,
  genres,
  tracks
}) {
  return {
    displayName: displayName.trim(),
    age: Number(age) || 18,
    avatar: avatar.trim() || null,
    quote: quote.trim(),
    interests: Array.from(
      new Set([
        ...cities,
        ...activities,
        ...sports,
        ...genres
      ])
    ),
    tracks
  };
}

export default function MyProfileFormScreen() {
  const router = useRouter();
  const ready = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quote, setQuote] = useState('');
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sports, setSports] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [newTrack, setNewTrack] = useState('');
  const [avatar, setAvatar] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const trackInputRef = useRef(null);
  const stateRef = useRef({});
  const loadingRef = useRef(true);
  const loadOkRef = useRef(false);
  const autosaveTimerRef = useRef(null);

  const load = useCallback(async () => {
    loadOkRef.current = false;
    try {
      const me = await api.getMe();
      setQuote(me.quote || '');
      const allInterests = Array.isArray(me.interests) ? [...me.interests] : [];
      setCities(allInterests.filter(i => CITY_OPTIONS.includes(i)));
      setActivities(allInterests.filter(i => ACTIVITY_OPTIONS.includes(i)));
      setSports(allInterests.filter(i => SPORT_OPTIONS.includes(i)));
      setGenres(allInterests.filter(i => MUSIC_GENRES.includes(i)));
      setTracks(Array.isArray(me.tracks) ? [...me.tracks] : []);
      setAvatar(me.avatar || '');
      setDisplayName(me.displayName || '');
      setAge(me.age != null ? String(me.age) : '');
      loadOkRef.current = true;
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useLayoutEffect(() => {
    stateRef.current = {
      displayName,
      age,
      avatar,
      quote,
      cities,
      activities,
      sports,
      genres,
      tracks
    };
  });

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const persistSilent = useCallback(async () => {
    if (!loadOkRef.current || loadingRef.current) return;
    try {
      await api.patchMe(buildMePayload(stateRef.current));
    } catch (e) {
      if (__DEV__) console.warn('anketa autosave', e?.message || e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (!loadOkRef.current || loadingRef.current) return;
        api
          .patchMe(buildMePayload(stateRef.current))
          .catch(e => {
            if (__DEV__) console.warn('anketa save on leave', e?.message || e);
          });
      };
    }, [])
  );

  useEffect(() => {
    if (!ready || loading || !loadOkRef.current) {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
      return;
    }
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      persistSilent();
    }, 800);
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
    };
  }, [
    ready,
    loading,
    cities,
    activities,
    sports,
    genres,
    tracks,
    quote,
    displayName,
    age,
    avatar,
    persistSilent
  ]);

  const saveAll = async () => {
    setSaving(true);
    try {
      await api.patchMe(buildMePayload(stateRef.current));
      Alert.alert('Сохранено');
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleList = (setter, label) => {
    setter(prev =>
      prev.includes(label)
        ? prev.filter(i => i !== label)
        : [...prev, label]
    );
  };

  const removeTrack = label => {
    setTracks(prev => prev.filter(i => i !== label));
  };

  const addTrack = () => {
    const trimmed = newTrack.trim();
    if (!trimmed) return;
    setTracks(prev =>
      prev.includes(trimmed) ? prev : [...prev, trimmed]
    );
    setNewTrack('');
  };

  if (!ready || loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
        <BottomTabs active="profile" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Анкета</Text>
        <TouchableOpacity hitSlop={12} onPress={saveAll} disabled={saving}>
          <Text style={styles.saveLink}>{saving ? '…' : 'Сохранить'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
      >
        <View style={styles.topRow}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPh]}>
              <Text style={styles.avatarPhText}>{(displayName || '?')[0]}</Text>
            </View>
          )}
          <View style={styles.topInfo}>
            <TextInput
              style={styles.nameInput}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Имя"
            />
            <TextInput
              style={styles.ageInput}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Возраст"
            />
            <TextInput
              style={styles.urlInput}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="URL фото"
              autoCapitalize="none"
            />
            <View style={styles.avatarPresetRow}>
              {AVATAR_PRESETS.map(url => {
                const active = avatar === url;
                return (
                  <TouchableOpacity
                    key={url}
                    style={[styles.avatarPreset, active && styles.avatarPresetActive]}
                    onPress={() => setAvatar(url)}
                  >
                    <Image source={{ uri: url }} style={styles.avatarPresetImg} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        <View style={styles.quoteCard}>
          <Text style={styles.quoteMark}>“</Text>
          <TextInput
            style={styles.quoteInput}
            value={quote}
            onChangeText={setQuote}
            multiline
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Города</Text>
          <View style={styles.chipsWrap}>
            {CITY_OPTIONS.map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.chip, cities.includes(label) && styles.chipActive]}
                onPress={() => toggleList(setCities, label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, cities.includes(label) && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Занятия</Text>
          <View style={styles.chipsWrap}>
            {ACTIVITY_OPTIONS.map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.chip, activities.includes(label) && styles.chipActive]}
                onPress={() => toggleList(setActivities, label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activities.includes(label) && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Спорт</Text>
          <View style={styles.chipsWrap}>
            {SPORT_OPTIONS.map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.chip, sports.includes(label) && styles.chipActive]}
                onPress={() => toggleList(setSports, label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, sports.includes(label) && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Музыка (жанры)</Text>
          <View style={styles.chipsWrap}>
            {MUSIC_GENRES.map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.chip, genres.includes(label) && styles.chipActive]}
                onPress={() => toggleList(setGenres, label)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, genres.includes(label) && styles.chipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Музыка (артисты/треки)</Text>
            <TouchableOpacity
              style={styles.plusCircle}
              onPress={() => trackInputRef.current?.focus()}
              activeOpacity={0.8}
              accessibilityLabel="Добавить трек"
            >
              <Text style={styles.plusCircleText}>＋</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chipsWrap}>
            {tracks.map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.chip, styles.chipActive]}
                onPress={() => removeTrack(label)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.chipText, styles.chipTextActive]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.addRow}>
            <TextInput
              ref={trackInputRef}
              style={styles.addInput}
              placeholder="Добавить трек, исполнителя или жанр..."
              placeholderTextColor="#C0B0A3"
              value={newTrack}
              onChangeText={setNewTrack}
              onSubmitEditing={addTrack}
              returnKeyType="done"
              blurOnSubmit={false}
            />
            <TouchableOpacity
              style={styles.addPlus}
              onPress={addTrack}
              activeOpacity={0.8}
            >
              <Text style={styles.addPlusText}>＋</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      </View>

      <BottomTabs active="profile" />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scroll: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  backArrow: {
    fontSize: 20,
    color: '#A49080',
    width: 24
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  saveLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F2A66E',
    minWidth: 72,
    textAlign: 'right'
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  topRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 16
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 18,
    marginRight: 12
  },
  topInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A3D2A',
    padding: 0,
    marginBottom: 4
  },
  ageInput: {
    fontSize: 15,
    color: '#5A3D2A',
    padding: 0,
    marginBottom: 4
  },
  urlInput: {
    fontSize: 12,
    color: '#8A7465',
    padding: 0
  },
  avatarPresetRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6
  },
  avatarPreset: {
    width: 28,
    height: 28,
    borderRadius: 14,
    padding: 1,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  avatarPresetActive: {
    borderColor: '#F2A66E'
  },
  avatarPresetImg: {
    width: '100%',
    height: '100%',
    borderRadius: 13
  },
  avatarPh: {
    backgroundColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPhText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#8A7465'
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF',
    marginBottom: 16
  },
  quoteMark: {
    color: '#F2A66E',
    fontSize: 22,
    marginRight: 6,
    lineHeight: 22
  },
  quoteInput: {
    flex: 1,
    fontSize: 14,
    color: '#5A3D2A',
    padding: 0,
    margin: 0
  },
  section: {
    marginBottom: 12
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5A3D2A',
    marginBottom: 8
  },
  chipsWrap: {
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
  plusCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8
  },
  plusCircleText: {
    fontSize: 18,
    lineHeight: 18,
    color: '#A49080'
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  addInput: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F2E3D7',
    fontSize: 13,
    color: '#5A3D2A'
  },
  addPlus: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8C9A9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  addPlusText: {
    fontSize: 18,
    lineHeight: 18,
    color: '#5A3D2A',
    fontWeight: '600'
  }
});

