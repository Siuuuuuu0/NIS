import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  listChatsForUser,
  getChat,
  getUserById,
  addMessage,
  deleteChat,
  requestRevealChat,
  respondRevealRequest,
  decideAnonymousAfterReject,
  anonWeekDeadlineIso,
  createChatBetween
} from '../db/store.js';

const router = Router();

function formatTime(iso) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function otherParticipant(chat, meId) {
  return chat.participantIds.find(id => id !== meId);
}

function overlapItems(a, b) {
  const left = new Set(Array.isArray(a) ? a : []);
  const right = new Set(Array.isArray(b) ? b : []);
  const overlap = [];
  for (const item of left) {
    if (right.has(item)) overlap.push(item);
  }
  return overlap;
}

const STARTER_PROMPTS_BY_INTEREST = {
  Баскетбол: 'Вы оба любите баскетбол - можно спросить, за какую команду болеет собеседник.',
  Футбол: 'У вас общий интерес к футболу - обсудите любимый клуб или недавний матч.',
  Кино: 'Вы оба любите кино - можно начать с вопроса про любимый жанр или последний фильм.',
  Путешествия: 'У вас совпали путешествия - спросите, какой город или страна запомнились больше всего.',
  Бег: 'Вы оба интересуетесь бегом - можно обсудить любимые маршруты и формат тренировок.',
  Йога: 'У вас общий интерес к йоге - можно спросить про любимый стиль или практику.',
  Теннис: 'Вы оба любите теннис - хороший старт: за кем из игроков интереснее всего следить.',
  'Хип-хоп': 'У вас совпал хип-хоп - можно спросить про любимого исполнителя или трек.',
  Поп: 'Вы оба слушаете поп - спросите, какой артист сейчас в плейлисте чаще всего.',
  Рок: 'У вас общий интерес к року - можно начать с любимой группы или альбома.',
  Джаз: 'Вы оба любите джаз - спросите, что чаще слушаете: классику или современный джаз.'
};

function buildStarterPrompts(sharedInterests) {
  const prompts = [];
  for (const interest of sharedInterests) {
    const text = STARTER_PROMPTS_BY_INTEREST[interest];
    if (text) prompts.push(text);
  }
  if (prompts.length) return prompts.slice(0, 3);
  if (sharedInterests.length) {
    return [
      `У вас есть общий интерес: "${sharedInterests[0]}". Можно начать диалог с вопроса об этом увлечении.`
    ];
  }
  return ['Можно начать с короткого знакомства и вопроса о хобби собеседника.'];
}

function buildAnonymousState(chat, meId) {
  const pendingRequest = chat?.revealRequest?.status === 'pending';
  const requestedByMe = pendingRequest && chat.revealRequest.requestedByUserId === meId;
  const requestedByOther = pendingRequest && chat.revealRequest.requestedByUserId !== meId;
  const needsAnonymousDecision = chat?.awaitingAnonymousDecisionForUserId === meId;

  return {
    canRequestReveal: !!(chat?.isAnonymous && !chat?.revealed && !pendingRequest && !needsAnonymousDecision),
    requestedByMe: !!requestedByMe,
    requestedByOther: !!requestedByOther,
    canRespondToReveal: !!requestedByOther,
    needsAnonymousDecision: !!needsAnonymousDecision,
    revealRequestStatus: chat?.revealRequest?.status || null
  };
}

function chatListItem(chat, meId) {
  const otherId = otherParticipant(chat, meId);
  const other = getUserById(otherId);
  const last = chat.messages[chat.messages.length - 1];
  const showAnon = chat.isAnonymous && !chat.revealed;
  const displayName = showAnon ? 'Аноним' : other?.displayName || 'Чат';
  const age = showAnon ? null : other?.age ?? null;
  return {
    id: chat.id,
    name: displayName,
    age,
    avatar: showAnon ? null : other?.avatar ?? null,
    lastMessage: last?.text || '',
    time: last ? formatTime(last.createdAt) : '',
    unread: false,
    isAnonymous: chat.isAnonymous,
    revealed: chat.revealed,
    createdAt: chat.createdAt,
    anonymousDeadline: chat.isAnonymous && !chat.revealed ? anonWeekDeadlineIso(chat.createdAt) : null
  };
}

function chatDetail(chat, meId) {
  const otherId = otherParticipant(chat, meId);
  const me = getUserById(meId);
  const other = getUserById(otherId);
  const showAnon = chat.isAnonymous && !chat.revealed;
  const sharedInterests = overlapItems(me?.interests || [], other?.interests || []);
  const titleName = showAnon ? 'Аноним' : other?.displayName || 'Чат';
  const titleAge = showAnon ? null : other?.age ?? null;
  const messages = chat.messages.map(m => ({
    id: m.id,
    fromMe: m.senderId === meId,
    text: m.text,
    time: formatTime(m.createdAt),
    createdAt: m.createdAt
  }));
  return {
    id: chat.id,
    title: titleAge != null ? `${titleName}, ${titleAge}` : titleName,
    name: titleName,
    age: titleAge,
    avatar: showAnon ? null : other?.avatar ?? null,
    otherUserId: showAnon ? null : otherId,
    isAnonymous: chat.isAnonymous,
    revealed: chat.revealed,
    sharedInterests,
    starterPrompts: buildStarterPrompts(sharedInterests),
    anonymousState: buildAnonymousState(chat, meId),
    createdAt: chat.createdAt,
    anonymousDeadline: chat.isAnonymous && !chat.revealed ? anonWeekDeadlineIso(chat.createdAt) : null,
    messages
  };
}

router.get('/', authRequired, (req, res) => {
  const chats = listChatsForUser(req.userId);
  res.json(chats.map(c => chatListItem(c, req.userId)));
});

router.get('/:id', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  res.json(chatDetail(chat, req.userId));
});

router.post('/', authRequired, (req, res) => {
  const { targetUserId, anonymous } = req.body || {};
  if (!targetUserId) return res.status(400).json({ error: 'targetUserId обязателен' });
  if (String(targetUserId) === String(req.userId)) {
    return res.status(400).json({ error: 'Нельзя создать чат с самим собой' });
  }

  const target = getUserById(targetUserId);
  if (!target) return res.status(404).json({ error: 'Пользователь не найден' });

  const chat = createChatBetween(req.userId, targetUserId, { anonymous: !!anonymous });
  res.json(chatDetail(chat, req.userId));
});

router.post('/:id/messages', authRequired, (req, res) => {
  const { text } = req.body || {};
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: 'Пустое сообщение' });
  }
  const msg = addMessage(req.params.id, req.userId, text.trim());
  if (!msg) return res.status(404).json({ error: 'Чат не найден' });
  res.status(201).json({
    id: msg.id,
    fromMe: true,
    text: msg.text,
    time: formatTime(msg.createdAt),
    createdAt: msg.createdAt
  });
});

router.delete('/:id', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  deleteChat(req.params.id);
  res.status(204).send();
});

router.post('/:id/reveal-request', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  const updated = requestRevealChat(req.params.id, req.userId);
  if (!updated) {
    return res.status(400).json({ error: 'Не удалось отправить запрос на раскрытие' });
  }
  res.json(chatDetail(updated, req.userId));
});

router.post('/:id/reveal-response', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  const accept = Boolean(req.body?.accept);
  const updated = respondRevealRequest(req.params.id, req.userId, accept);
  if (!updated) {
    return res.status(400).json({ error: 'Не удалось обработать ответ на раскрытие' });
  }
  res.json(chatDetail(updated, req.userId));
});

router.post('/:id/anonymous-decision', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  const continueAnonymous = Boolean(req.body?.continueAnonymous);
  const result = decideAnonymousAfterReject(req.params.id, req.userId, continueAnonymous);

  if (result.status === 'deleted') {
    return res.json({ deleted: true, chatId: req.params.id });
  }
  if (result.status === 'no_pending_decision') {
    return res.status(400).json({ error: 'Нет ожидающего решения по анонимному режиму' });
  }
  if (result.status === 'forbidden') {
    return res.status(403).json({ error: 'Нет доступа к чату' });
  }
  if (!result.chat) {
    return res.status(404).json({ error: 'Чат не найден' });
  }

  res.json({ deleted: false, chat: chatDetail(result.chat, req.userId) });
});

export default router;
