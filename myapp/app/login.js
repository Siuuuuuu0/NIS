import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { api } from '../lib/api';
import { setToken } from '../lib/authStorage';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('andrey');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { token } = await api.login(username.trim(), password);
      await setToken(token);
      router.replace('/');
    } catch (e) {
      setError(e.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const { token } = await api.register(username.trim(), password);
      await setToken(token);
      router.replace('/');
    } catch (e) {
      setError(e.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>Вход</Text>
        <Text style={styles.hint}>
          Тест: andrey / password123 (запусти бэкенд в папке backend)
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Имя пользователя"
          placeholderTextColor="#A49080"
          autoCapitalize="none"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Пароль"
          placeholderTextColor="#A49080"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btn}
          onPress={onLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#5A3D2A" />
          ) : (
            <Text style={styles.btnText}>Войти</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={onRegister}
          disabled={loading}
        >
          <Text style={styles.btnSecondaryText}>Регистрация</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF7F0' },
  flex: { flex: 1, paddingHorizontal: 24, paddingTop: 40 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#5A3D2A',
    marginBottom: 8
  },
  hint: { fontSize: 12, color: '#A49080', marginBottom: 24 },
  input: {
    backgroundColor: '#F2E3D7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#5A3D2A',
    marginBottom: 12
  },
  error: { color: '#c44', marginBottom: 12 },
  btn: {
    backgroundColor: '#F8C9A9',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8
  },
  btnText: { fontSize: 16, fontWeight: '600', color: '#5A3D2A' },
  btnSecondary: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  btnSecondaryText: { color: '#F2A66E', fontWeight: '600' }
});
