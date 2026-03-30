import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';
import { clearToken } from '../../lib/authStorage';

export default function ProfileScreen() {
  const router = useRouter();
  const ready = useRequireAuth();
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const me = await api.getMe();
      setDisplayName(me.displayName || '');
      setAge(me.age != null ? String(me.age) : '');
      setAvatar(me.avatar || '');
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (ready) load();
  }, [ready, load]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patchMe({
        displayName: displayName.trim(),
        age: Number(age) || 18,
        avatar: avatar.trim() || null
      });
      Alert.alert('Сохранено');
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = () => {
    Alert.alert(
      'Удалить анкету?',
      'Данные будут помечены как удалённые (демо).',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteMe();
              await clearToken();
              router.replace('/login');
            } catch (e) {
              Alert.alert('Ошибка', e.message);
            }
          }
        }
      ]
    );
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
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>Профиль</Text>
          <TouchableOpacity hitSlop={12}>
            <Text style={styles.menuDots}>⋮</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileBlock}>
            <View style={styles.avatarWrapper}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>
                    {(displayName || '?')[0]}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Отображаемое имя"
              placeholderTextColor="#A49080"
            />
            <Text style={styles.label}>Возраст</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              placeholder="Возраст"
              placeholderTextColor="#A49080"
            />
            <Text style={styles.label}>URL аватара</Text>
            <TextInput
              style={styles.input}
              value={avatar}
              onChangeText={setAvatar}
              placeholder="https://..."
              placeholderTextColor="#A49080"
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={save}
              disabled={saving}
            >
              <Text style={styles.saveBtnText}>
                {saving ? 'Сохранение…' : 'Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => router.push('/profile/anketa')}
            >
              <Text style={styles.rowIcon}>👤</Text>
              <Text style={styles.rowText}>Анкета</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => router.push('/profile/security')}
            >
              <Text style={styles.rowIcon}>🛡️</Text>
              <Text style={styles.rowText}>Безопасность</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => router.push('/profile/agreement')}
            >
              <Text style={styles.rowIcon}>💬</Text>
              <Text style={styles.rowText}>Пользовательское соглашение</Text>
              <Text style={styles.rowArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.deleteBtn} onPress={deleteAccount}>
            <Text style={styles.deleteBtnText}>Удалить анкету</Text>
          </TouchableOpacity>
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
  scrollContent: {
    paddingBottom: 24
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
  menuDots: {
    width: 24,
    textAlign: 'right',
    fontSize: 18,
    color: '#A49080'
  },
  profileBlock: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16
  },
  avatarWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 12,
    alignSelf: 'center',
    backgroundColor: '#E5D9CF'
  },
  avatar: {
    width: '100%',
    height: '100%'
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarPlaceholderText: {
    fontSize: 40,
    color: '#8A7465',
    fontWeight: '700'
  },
  label: {
    fontSize: 12,
    color: '#A49080',
    marginBottom: 4
  },
  input: {
    backgroundColor: '#F2E3D7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#5A3D2A',
    marginBottom: 12
  },
  saveBtn: {
    backgroundColor: '#F8C9A9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4
  },
  saveBtnText: {
    fontWeight: '600',
    color: '#5A3D2A'
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E5D9CF',
    overflow: 'hidden',
    marginBottom: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5D9CF'
  },
  rowIcon: {
    width: 28,
    fontSize: 16,
    color: '#F2A66E'
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    color: '#5A3D2A'
  },
  rowArrow: {
    fontSize: 18,
    color: '#C0B0A3'
  },
  deleteBtn: {
    marginHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center'
  },
  deleteBtnText: {
    color: '#c44',
    fontWeight: '600'
  }
});
