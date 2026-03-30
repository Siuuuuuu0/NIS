import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '../../components/BottomTabs';

export default function AgreementScreen() {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Пользовательское соглашение</Text>
        <TouchableOpacity hitSlop={12}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Кратко</Text>
        <Text style={styles.text}>
          Пользуясь приложением, вы соглашаетесь соблюдать правила общения
          и не нарушать права других пользователей.
        </Text>
        <Text style={styles.text}>
          Запрещён спам, оскорбления, публикация персональных данных без
          согласия.
        </Text>
        <Text style={styles.text}>
          В случае нарушений пользователи могут быть ограничены или
          удалены.
        </Text>
        <Text style={styles.text}>
          Это демо-версия: детали и реальные документы подключим позже.
        </Text>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  menuDots: {
    width: 24,
    textAlign: 'right',
    fontSize: 18,
    color: '#A49080'
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A3D2A',
    marginBottom: 10
  },
  text: {
    fontSize: 13,
    color: '#8A7465',
    marginBottom: 12,
    lineHeight: 18
  }
});

