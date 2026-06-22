import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BottomTabs } from '../../components/BottomTabs';
import { useRequireAuth } from '../../hooks/useRequireAuth';
import { api } from '../../lib/api';

export default function ChatScreen() {
  const router = useRouter();
  const ready = useRequireAuth();
  const params = useLocalSearchParams();
  const chatId = String(params.id ?? '');

  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [dismissedAnonInfo, setDismissedAnonInfo] = useState(false);
  const [isProfilePromptVisible, setIsProfilePromptVisible] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const loadChat = useCallback(async ({ silent = false } = {}) => {
    if (!chatId) return;
    try {
      const d = await api.getChat(chatId);
      setDetail(d);
    } catch (e) {
      if (e.code === 'UNAUTHORIZED') {
        router.replace('/login');
        return;
      }
      if (!silent) {
        Alert.alert('Ошибка', e.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [chatId, router]);

  useEffect(() => {
    if (ready && chatId) loadChat();
  }, [ready, chatId, loadChat]);

  useEffect(() => {
    if (!ready || !chatId) return undefined;
    const timer = setInterval(() => {
      loadChat({ silent: true });
    }, 3000);
    return () => clearInterval(timer);
  }, [ready, chatId, loadChat]);

  const isAnonExpired =
    detail?.isAnonymous &&
    !detail?.revealed &&
    detail?.anonymousDeadline &&
    Date.now() >= new Date(detail.anonymousDeadline).getTime();

  const isAnonChat = !!(detail?.isAnonymous && !detail?.revealed);
  const anonymousState = detail?.anonymousState || {};
  const showExpiredOverlay =
    isAnonExpired &&
    !isProfilePromptVisible &&
    !anonymousState.requestedByMe &&
    !anonymousState.canRespondToReveal &&
    !anonymousState.needsAnonymousDecision;
  const showAnonInfo = isAnonChat && !isAnonExpired && !dismissedAnonInfo;
  const showStarterPrompts =
    Array.isArray(detail?.starterPrompts) &&
    detail.starterPrompts.length > 0 &&
    (detail?.messages?.length || 0) <= 2;

  const title = detail?.title || 'Чат';

  const onSend = async () => {
    const t = inputValue.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      await api.sendMessage(chatId, t);
      setInputValue('');
      await loadChat();
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    } finally {
      setSending(false);
    }
  };

  const onRequestReveal = async () => {
    try {
      const d = await api.requestRevealChat(chatId);
      setDetail(d);
      setIsProfilePromptVisible(false);
      await loadChat();
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  const onRespondReveal = async accept => {
    try {
      const d = await api.respondRevealChat(chatId, accept);
      setDetail(d);
      await loadChat();
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  const onAnonymousDecision = async continueAnonymous => {
    try {
      const result = await api.decideAnonymousAfterReject(chatId, continueAnonymous);
      if (result?.deleted) {
        Alert.alert('Чат удален', 'Диалог завершен по вашему выбору.');
        router.replace('/');
        return;
      }
      if (result?.chat) {
        setDetail(result.chat);
      } else {
        await loadChat();
      }
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  const onDeleteChat = () => {
    setIsMenuOpen(false);
    setDeleteConfirmVisible(true);
  };

  const performDeleteChat = async () => {
    setDeleteConfirmVisible(false);
    try {
      await api.deleteChat(chatId);
      router.replace('/');
    } catch (e) {
      Alert.alert('Ошибка', e.message);
    }
  };

  if (!ready) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  if (loading || !detail) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
            <Text style={styles.backArrow}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Чат</Text>
          <View style={{ width: 24 }} />
        </View>
        <ActivityIndicator style={{ marginTop: 40 }} />
        <BottomTabs active="chats" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>{'<'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerAvatarWrapper}
          activeOpacity={0.8}
          disabled={!detail.otherUserId}
          onPress={() => {
            if (detail.otherUserId) {
              router.push(`/profile/${detail.otherUserId}`);
            }
          }}
        >
          {detail.avatar ? (
            <Image source={{ uri: detail.avatar }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarPlaceholderText}>
                {String(detail.name || '?')[0]}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <TouchableOpacity
          hitSlop={12}
          onPress={() => setIsMenuOpen(prev => !prev)}
        >
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      {isMenuOpen && (
        <View style={styles.menu}>
          {isAnonChat && anonymousState.canRequestReveal && (
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuOpen(false);
                setIsProfilePromptVisible(true);
              }}
            >
              <Text style={styles.menuItemText}>Показать анкету</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setIsMenuOpen(false);
              onDeleteChat();
            }}
          >
            <Text style={styles.menuItemText}>Удалить чат</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadChat({ silent: true });
            }}
          />
        }
      >
        {isAnonChat && anonymousState.requestedByMe && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              Запрос на раскрытие отправлен. Ждем решение собеседника.
            </Text>
          </View>
        )}
        {isAnonChat && Array.isArray(detail?.sharedInterests) && detail.sharedInterests.length > 0 && (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              Общие интересы: {detail.sharedInterests.join(', ')}
            </Text>
          </View>
        )}
        {isAnonChat && showStarterPrompts && (
          <View style={styles.startersCard}>
            <Text style={styles.startersTitle}>Подсказки для старта</Text>
            {detail.starterPrompts.map((prompt, idx) => (
              <Text key={`starter-${idx}`} style={styles.starterItem}>
                {`\u2022 ${prompt}`}
              </Text>
            ))}
          </View>
        )}
        {(detail.messages || []).map(msg => (
          <View
            key={msg.id}
            style={[
              styles.messageRow,
              msg.fromMe ? styles.messageRowMe : styles.messageRowOther
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.fromMe ? styles.messageBubbleMe : styles.messageBubbleOther
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
              <Text style={styles.messageTime}>{msg.time}</Text>
            </View>
          </View>
        ))}
        {(!detail.messages || detail.messages.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Сообщений пока нет</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.plusBtn} hitSlop={10}>
          <Text style={styles.plusText}>＋</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Напишите сообщение..."
          placeholderTextColor="#C0B0A3"
          value={inputValue}
          onChangeText={setInputValue}
          editable={!isAnonExpired}
        />
        <TouchableOpacity
          style={styles.sendButton}
          activeOpacity={0.8}
          onPress={onSend}
          disabled={sending || isAnonExpired}
        >
          <Text style={styles.sendButtonText}>Отправить</Text>
        </TouchableOpacity>
      </View>

      {showExpiredOverlay && (
        <View style={styles.overlay}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Срок анонимного чата</Text>
            <Text style={styles.infoText}>
              Этот анонимный чат создан более недели назад. Раскройте личности,
              иначе чат будет удалён.
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setIsProfilePromptVisible(true)}
            >
              <Text style={styles.infoButtonText}>Раскрыть личности</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.infoButton, { marginTop: 8, backgroundColor: '#E6D7CC' }]}
              onPress={onDeleteChat}
            >
              <Text style={styles.infoButtonText}>Удалить чат</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showAnonInfo && (
        <View style={styles.overlay}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Чаты на платформе</Text>
            <Text style={styles.infoText}>
              Вы анонимны и можете оставаться скрыты, пока не решите открыться
              собеседнику. Анонимный чат нужно раскрыть в течение недели.
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setDismissedAnonInfo(true)}
            >
              <Text style={styles.infoButtonText}>Понятно</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isProfilePromptVisible && (
        <View style={styles.overlay}>
          <View style={styles.promptCard}>
            <Text style={styles.infoTitle}>Отправить запрос на раскрытие?</Text>
            <Text style={styles.infoText}>
              Собеседник увидит запрос и сможет принять или отклонить его. До
              подтверждения чат останется анонимным.
            </Text>
            <View style={styles.promptButtonsRow}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonSecondary]}
                onPress={() => setIsProfilePromptVisible(false)}
              >
                <Text
                  style={[
                    styles.promptButtonText,
                    styles.promptButtonTextSecondary
                  ]}
                >
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonPrimary]}
                onPress={onRequestReveal}
              >
                <Text style={styles.promptButtonTextPrimary}>
                  Отправить запрос
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isAnonChat && anonymousState.canRespondToReveal && (
        <View style={styles.overlay}>
          <View style={styles.promptCard}>
            <Text style={styles.infoTitle}>Собеседник хочет раскрыться</Text>
            <Text style={styles.infoText}>
              Если примете запрос, анкеты откроются полностью для обеих сторон.
            </Text>
            <View style={styles.promptButtonsRow}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonSecondary]}
                onPress={() => onRespondReveal(false)}
              >
                <Text style={[styles.promptButtonText, styles.promptButtonTextSecondary]}>
                  Отклонить
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonPrimary]}
                onPress={() => onRespondReveal(true)}
              >
                <Text style={styles.promptButtonTextPrimary}>Принять</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {deleteConfirmVisible && (
        <View style={[styles.overlay, styles.overlayTop]}>
          <View style={styles.promptCard}>
            <Text style={styles.infoTitle}>Удалить чат?</Text>
            <Text style={styles.infoText}>
              Переписка будет удалена без возможности восстановления.
            </Text>
            <View style={styles.promptButtonsRow}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonSecondary]}
                onPress={() => setDeleteConfirmVisible(false)}
              >
                <Text style={[styles.promptButtonText, styles.promptButtonTextSecondary]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonPrimary]}
                onPress={performDeleteChat}
              >
                <Text style={styles.promptButtonTextPrimary}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {isAnonChat && anonymousState.needsAnonymousDecision && (
        <View style={styles.overlay}>
          <View style={styles.promptCard}>
            <Text style={styles.infoTitle}>Запрос на раскрытие отклонен</Text>
            <Text style={styles.infoText}>
              Хотите продолжить в анонимном режиме? Если нет, чат будет удален
              автоматически.
            </Text>
            <View style={styles.promptButtonsRow}>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonSecondary]}
                onPress={() => onAnonymousDecision(false)}
              >
                <Text style={[styles.promptButtonText, styles.promptButtonTextSecondary]}>
                  Удалить чат
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.promptButton, styles.promptButtonPrimary]}
                onPress={() => onAnonymousDecision(true)}
              >
                <Text style={styles.promptButtonTextPrimary}>Продолжить анонимно</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <BottomTabs active="chats" />
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
  headerAvatarWrapper: {
    marginRight: 8
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  headerAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5D9CF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerAvatarPlaceholderText: {
    color: '#8A7465',
    fontWeight: '600',
    fontSize: 14
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
  menu: {
    position: 'absolute',
    top: 52,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    minWidth: 170,
    zIndex: 20
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  menuItemText: {
    fontSize: 14,
    color: '#5A3D2A'
  },
  statusBanner: {
    backgroundColor: '#F2E3D7',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8
  },
  statusBannerText: {
    fontSize: 12,
    color: '#8A7465'
  },
  startersCard: {
    backgroundColor: '#FFF0E5',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F2C9AA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10
  },
  startersTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A3D2A',
    marginBottom: 6
  },
  starterItem: {
    fontSize: 12,
    color: '#8A7465',
    marginBottom: 4
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row'
  },
  messageRowMe: {
    justifyContent: 'flex-end'
  },
  messageRowOther: {
    justifyContent: 'flex-start'
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16
  },
  messageBubbleOther: {
    backgroundColor: '#F2E3D7',
    borderBottomLeftRadius: 2
  },
  messageBubbleMe: {
    backgroundColor: '#F8C9A9',
    borderBottomRightRadius: 2
  },
  messageText: {
    color: '#5A3D2A',
    fontSize: 14
  },
  messageTime: {
    alignSelf: 'flex-end',
    fontSize: 10,
    color: '#B0A097',
    marginTop: 2
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2E3D7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  plusText: {
    color: '#A49080',
    fontSize: 18,
    lineHeight: 18
  },
  input: {
    flex: 1,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#F2E3D7',
    fontSize: 13,
    color: '#5A3D2A'
  },
  sendButton: {
    marginLeft: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#F8C9A9'
  },
  sendButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5A3D2A'
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center'
  },
  emptyText: {
    color: '#A49080'
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 30
  },
  overlayTop: {
    zIndex: 40
  },
  infoCard: {
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '100%'
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A3D2A',
    marginBottom: 8
  },
  infoText: {
    fontSize: 13,
    color: '#8A7465',
    marginBottom: 6
  },
  infoButton: {
    marginTop: 10,
    alignSelf: 'stretch',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#F8C9A9',
    alignItems: 'center'
  },
  infoButtonText: {
    color: '#5A3D2A',
    fontSize: 13,
    fontWeight: '600'
  },
  promptCard: {
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: '100%'
  },
  promptButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14
  },
  promptButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center'
  },
  promptButtonSecondary: {
    marginRight: 8,
    backgroundColor: '#E6D7CC'
  },
  promptButtonPrimary: {
    marginLeft: 8,
    backgroundColor: '#F8C9A9'
  },
  promptButtonText: {
    fontSize: 13,
    fontWeight: '500'
  },
  promptButtonTextSecondary: {
    color: '#5A3D2A'
  },
  promptButtonTextPrimary: {
    color: '#5A3D2A',
    fontWeight: '600'
  }
});
