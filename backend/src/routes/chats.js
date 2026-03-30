import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  listChatsForUser,
  getChat,
  getUserById,
  publicUser,
  addMessage,
  deleteChat,
  revealChat,
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
  const other = getUserById(otherId);
  const showAnon = chat.isAnonymous && !chat.revealed;
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

router.post('/:id/reveal', authRequired, (req, res) => {
  const chat = getChat(req.params.id);
  if (!chat || !chat.participantIds.includes(req.userId)) {
    return res.status(404).json({ error: 'Чат не найден' });
  }
  const updated = revealChat(req.params.id);
  if (!updated) {
    return res.status(400).json({ error: 'Чат не анонимный или уже раскрыт' });
  }
  res.json(chatDetail(updated, req.userId));
});

export default router;
