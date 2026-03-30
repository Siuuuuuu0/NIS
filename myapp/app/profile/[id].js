import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';

const Chip = ({ children }) => (
  <View style={styles.chip}>
    <Text style={styles.chipText} numberOfLines={1}>
      {children}
    </Text>
  </View>
);

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const ready = useRequireAuth();
  const params = useLocalSearchParams();
  const id = String(params.id ?? '');

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setError('');
    try {
      const u = await api.getUser(id);
      setUser(u);
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        router.replace('/login');
        return;
      }
      setError(e.message || 'Не найдено');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (ready && id) load();
  }, [ready, id, load]);

  if (!ready) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <ActivityIndicator style={{ marginTop: 40 }} />
        <BottomTabs active="profile" />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
        <BottomTabs active="profile" />
      </SafeAreaView>
    );
  }

  if (!user || error) {
    return (
      <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Профиль</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text style={styles.subtitle}>{error || 'Пользователь не найден'}</Text>
        </View>
        <BottomTabs active="profile" />
      </SafeAreaView>
    );
  }

  const title =
    user.age != null ? `${user.displayName}, ${user.age}` : user.displayName;
  const chips = user.interests || [];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Профиль</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTopRow}>
          <View style={styles.avatarBox}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarPlaceholderLarge}>
                <Text style={styles.avatarPlaceholderTextLarge}>
                  {String(user.displayName || '?')[0]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardMain}>
            <Text style={styles.cardTitle}>{title}</Text>
            <View style={styles.chipsRow}>
              {chips.map((c, idx) => (
                <Chip key={`${user.id}-chip-${idx}`}>{c}</Chip>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Фраза из анкеты:</Text>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteMark}>“</Text>
            <Text style={styles.quoteText}>{user.quote || '—'}</Text>
          </View>
        </View>

        {user.tracks?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Музыка:</Text>
            <View style={styles.chipsRow}>
              {user.tracks.map((t, idx) => (
                <Chip key={`${user.id}-t-${idx}`}>{t}</Chip>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.9}>
          <Text style={styles.inviteBtnText}>Отправить инвайт</Text>
        </TouchableOpacity>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  subtitle: {
    color: '#A49080'
  },
  card: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF'
  },
  cardTopRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  avatarBox: {
    marginRight: 12
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 18
  },
  avatarPlaceholderLarge: {
    width: 96,
    height: 96,
    borderRadius: 18,
    backgroundColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholderTextLarge: {
    color: '#8A7465',
    fontWeight: '700',
    fontSize: 28
  },
  cardMain: {
    flex: 1,
    justifyContent: 'space-between'
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5A3D2A',
    marginBottom: 8
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  chip: {
    backgroundColor: '#F2E3D7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  chipText: {
    fontSize: 11,
    color: '#8A7465'
  },
  section: {
    marginTop: 10
  },
  sectionLabel: {
    fontSize: 13,
    color: '#A49080',
    marginBottom: 4
  },
  quoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF'
  },
  quoteMark: {
    color: '#F2A66E',
    fontSize: 20,
    marginRight: 6,
    lineHeight: 20
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    color: '#5A3D2A'
  },
  inviteBtn: {
    marginTop: 14,
    alignSelf: 'flex-end',
    backgroundColor: '#F2A66E',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 18
  },
  inviteBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600'
  }
});
