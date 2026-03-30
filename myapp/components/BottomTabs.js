import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TABS = [
  { key: 'profile', label: 'Профиль' },
  { key: 'chats', label: 'Чаты' },
  { key: 'search', label: 'Поиск' }
];

export const BottomTabs = ({ active = 'chats', onChange }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const defaultNavigate = key => {
    if (key === 'profile') router.push('/profile');
    if (key === 'chats') router.push('/');
    if (key === 'search') router.push('/search');
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {TABS.map(tab => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => (onChange ? onChange(tab.key) : defaultNavigate(tab.key))}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5D9CF',
    backgroundColor: '#FFF7F0',
    justifyContent: 'space-between'
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: '#F8C9A9'
  },
  label: {
    fontSize: 12,
    color: '#A49080'
  },
  labelActive: {
    color: '#5A3D2A',
    fontWeight: '600'
  }
});