import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const now = () => new Date().toISOString();

/** @type {Map<string, object>} */
const usersById = new Map();
/** @type {Map<string, string>} username -> userId */
const usernameToId = new Map();
/** @type {Map<string, object>} */
const chatsById = new Map();

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

export function seed() {
  const andreyId = 'u-andrey';
  const kirillId = 'u-kirill';
  const kentId = 'u-kent';
  const alinaId = 'u-alina';
  const dashaId = 'u-dasha';
  const mishaId = 'u-misha';
  const lenaId = 'u-lena';
  const romanId = 'u-roman';
  const katyaId = 'u-katya';
  const ilyaId = 'u-ilya';

  usersById.set(andreyId, {
    id: andreyId,
    username: 'andrey',
    passwordHash: hash('password123'),
    displayName: 'Андрей',
    age: 25,
    avatar: 'https://i.pravatar.cc/200?img=12',
    quote: 'Никогда не был в Италии.',
    interests: ['Москва', 'Кино', 'Путешествия', 'Хип-хоп', 'Футбол', 'Бокс'],
    tracks: ['OG Buda', 'Boulevard Depo'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('andrey', andreyId);

  usersById.set(kirillId, {
    id: kirillId,
    username: 'kirill',
    passwordHash: hash('password123'),
    displayName: 'Кирилл',
    age: 32,
    avatar: 'https://i.pravatar.cc/100?img=1',
    quote: 'Люблю мороженое',
    interests: ['Санкт-Петербург', 'Путешествия', 'Кино', 'Баскетбол', 'Футбол', 'Хип-хоп'],
    tracks: ['OG Buda'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('kirill', kirillId);

  usersById.set(kentId, {
    id: kentId,
    username: 'kent',
    passwordHash: hash('password123'),
    displayName: 'Кент',
    age: 18,
    avatar: null,
    quote: 'Я никогда не был в Италии.',
    interests: ['Кино', 'Музыка', 'Бокс', 'Футбол'],
    tracks: ['Boulevard Depo'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('kent', kentId);

  usersById.set(alinaId, {
    id: alinaId,
    username: 'alina',
    passwordHash: hash('password123'),
    displayName: 'Алина',
    age: 46,
    avatar: null,
    quote: 'Путешествовала по России.',
    interests: ['Кино', 'Животные', 'Путешествия', 'Баскетбол'],
    tracks: [],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('alina', alinaId);

  usersById.set(dashaId, {
    id: dashaId,
    username: 'dasha',
    passwordHash: hash('password123'),
    displayName: 'Даша',
    age: 24,
    avatar: 'https://i.pravatar.cc/200?img=32',
    quote: 'Люблю бег и концерты.',
    interests: ['Москва', 'Бег', 'Теннис', 'Путешествия', 'Поп'],
    tracks: ['Billie Eilish', 'Lana Del Rey'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('dasha', dashaId);

  usersById.set(mishaId, {
    id: mishaId,
    username: 'misha',
    passwordHash: hash('password123'),
    displayName: 'Миша',
    age: 27,
    avatar: 'https://i.pravatar.cc/200?img=15',
    quote: 'Кино, футбол, рэп.',
    interests: ['Санкт-Петербург', 'Кино', 'Футбол', 'Хип-хоп'],
    tracks: ['OG Buda', 'MORGENSHTERN'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('misha', mishaId);

  usersById.set(lenaId, {
    id: lenaId,
    username: 'lena',
    passwordHash: hash('password123'),
    displayName: 'Лена',
    age: 23,
    avatar: null,
    quote: 'Горы, йога, джаз.',
    interests: ['Казань', 'Йога', 'Путешествия', 'Баскетбол', 'Джаз'],
    tracks: ['Nujabes', 'FKJ'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('lena', lenaId);

  usersById.set(romanId, {
    id: romanId,
    username: 'roman',
    passwordHash: hash('password123'),
    displayName: 'Роман',
    age: 29,
    avatar: 'https://i.pravatar.cc/200?img=22',
    quote: 'Люблю футбол и кино по вечерам.',
    interests: ['Москва', 'Футбол', 'Кино', 'Рок'],
    tracks: ['Arctic Monkeys', 'Miyagi'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('roman', romanId);

  usersById.set(katyaId, {
    id: katyaId,
    username: 'katya',
    passwordHash: hash('password123'),
    displayName: 'Катя',
    age: 22,
    avatar: 'https://i.pravatar.cc/200?img=47',
    quote: 'Йога, путешествия и поп-музыка.',
    interests: ['Санкт-Петербург', 'Йога', 'Путешествия', 'Поп'],
    tracks: ['Dua Lipa', 'Ariana Grande'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('katya', katyaId);

  usersById.set(ilyaId, {
    id: ilyaId,
    username: 'ilya',
    passwordHash: hash('password123'),
    displayName: 'Илья',
    age: 26,
    avatar: null,
    quote: 'Бокс, баскетбол, хип-хоп.',
    interests: ['Казань', 'Бокс', 'Баскетбол', 'Хип-хоп'],
    tracks: ['OG Buda', 'Big Baby Tape'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('ilya', ilyaId);

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();

  chatsById.set('c1', {
    id: 'c1',
    participantIds: [andreyId, kirillId],
    isAnonymous: false,
    revealed: true,
    createdAt: threeDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: kirillId,
        text: 'Доброе утро!\nЛюбишь мороженое?',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'm2',
        senderId: andreyId,
        text: 'Доброе! Люблю ванильное, а ты?',
        createdAt: new Date(Date.now() - 3500000).toISOString()
      }
    ]
  });

  chatsById.set('c2', {
    id: 'c2',
    participantIds: [andreyId, kirillId],
    isAnonymous: true,
    revealed: false,
    createdAt: threeDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: kirillId,
        text: 'Мне понравилась ваша анкета, давайте познакомимся?',
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'm2',
        senderId: andreyId,
        text: 'Давайте! Расскажете о своих интересах?',
        createdAt: new Date(Date.now() - 7100000).toISOString()
      }
    ]
  });

  chatsById.set('c2-old', {
    id: 'c2-old',
    participantIds: [andreyId, kirillId],
    isAnonymous: true,
    revealed: false,
    createdAt: eightDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: kirillId,
        text: 'Старый анонимный чат (для теста недели).',
        createdAt: eightDaysAgo
      }
    ]
  });

  chatsById.set('c3', {
    id: 'c3',
    participantIds: [andreyId, kentId],
    isAnonymous: false,
    revealed: true,
    createdAt: threeDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: kentId,
        text: 'Что любишь слушать?',
        createdAt: new Date(Date.now() - 5000000).toISOString()
      }
    ]
  });

  chatsById.set('c4', {
    id: 'c4',
    participantIds: [andreyId, alinaId],
    isAnonymous: false,
    revealed: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      {
        id: 'm1',
        senderId: alinaId,
        text: 'Путешествовала по Рос...',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  });
}

export function listUsers() {
  return [...usersById.values()].filter(u => !u.deleted);
}

export function getUserById(id) {
  const u = usersById.get(id);
  if (!u || u.deleted) return null;
  return u;
}

export function getUserByUsername(username) {
  const id = usernameToId.get(String(username).toLowerCase());
  return id ? getUserById(id) : null;
}

export function createUser({ username, password }) {
  const key = String(username).toLowerCase();
  if (usernameToId.has(key)) return null;
  const id = `u-${uuid()}`;
  const user = {
    id,
    username: key,
    passwordHash: hash(password),
    displayName: username,
    age: 18,
    avatar: null,
    quote: '',
    interests: [],
    tracks: [],
    createdAt: now(),
    deleted: false
  };
  usersById.set(id, user);
  usernameToId.set(key, id);
  return user;
}

export function updateUser(id, patch) {
  const u = getUserById(id);
  if (!u) return null;
  const allowed = ['displayName', 'age', 'avatar', 'quote', 'interests', 'tracks'];
  for (const k of allowed) {
    if (patch[k] !== undefined) u[k] = patch[k];
  }
  return u;
}

export function softDeleteUser(id) {
  const u = usersById.get(id);
  if (!u) return false;
  u.deleted = true;
  return true;
}

export function listChatsForUser(userId) {
  return [...chatsById.values()].filter(c => c.participantIds.includes(userId));
}

export function getChat(id) {
  return chatsById.get(id) || null;
}

export function deleteChat(id) {
  return chatsById.delete(id);
}

export function addMessage(chatId, senderId, text) {
  const chat = chatsById.get(chatId);
  if (!chat || !chat.participantIds.includes(senderId)) return null;
  const msg = {
    id: `m-${uuid()}`,
    senderId,
    text: String(text),
    createdAt: now()
  };
  chat.messages.push(msg);
  return msg;
}

export function revealChat(chatId) {
  const chat = chatsById.get(chatId);
  if (!chat || !chat.isAnonymous) return null;
  chat.revealed = true;
  chat.isAnonymous = false;
  return chat;
}

export function publicUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    username: u.username,
    displayName: u.displayName,
    age: u.age,
    avatar: u.avatar,
    quote: u.quote,
    interests: u.interests,
    tracks: u.tracks
  };
}

export function anonWeekDeadlineIso(createdAt) {
  const t = new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000;
  return new Date(t).toISOString();
}

export function findChatBetween(userIdA, userIdB) {
  const a = userIdA;
  const b = userIdB;
  for (const chat of chatsById.values()) {
    if (!chat.participantIds || chat.participantIds.length !== 2) continue;
    const hasA = chat.participantIds.includes(a);
    const hasB = chat.participantIds.includes(b);
    if (hasA && hasB) return chat;
  }
  return null;
}

export function createChatBetween(userIdA, userIdB, { anonymous = false } = {}) {
  const existing = findChatBetween(userIdA, userIdB);
  if (existing) return existing;

  const chatId = `c-${uuid()}`;
  const createdAt = now();
  const chat = {
    id: chatId,
    participantIds: [userIdA, userIdB],
    isAnonymous: !!anonymous,
    revealed: !anonymous,
    createdAt,
    messages: []
  };
  chatsById.set(chatId, chat);
  return chat;
}
