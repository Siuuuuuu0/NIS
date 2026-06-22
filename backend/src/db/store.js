import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const now = () => new Date().toISOString();
const PRESET_INTERESTS = [
  'Москва',
  'Санкт-Петербург',
  'Казань',
  'Екатеринбург',
  'Кино',
  'Путешествия',
  'Животные',
  'Прогулки',
  'Книги',
  'Футбол',
  'Баскетбол',
  'Бокс',
  'Бег',
  'Йога',
  'Теннис',
  'Хип-хоп',
  'Поп',
  'Рок',
  'Джаз',
  'Искусство',
  'Инди',
  'Музыка'
];
const PRESET_INTERESTS_SET = new Set(PRESET_INTERESTS);

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
  const vikaId = 'u-vika';
  const sergeyId = 'u-sergey';
  const nastyaId = 'u-nastya';
  const olegId = 'u-oleg';
  const polinaId = 'u-polina';

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

  usersById.set(vikaId, {
    id: vikaId,
    username: 'vika',
    passwordHash: hash('password123'),
    displayName: 'Вика',
    age: 21,
    avatar: 'https://i.pravatar.cc/200?img=5',
    quote: 'Рисую и слушаю инди.',
    interests: ['Москва', 'Искусство', 'Путешествия', 'Инди'],
    tracks: ['Arctic Monkeys', 'The Weeknd'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('vika', vikaId);

  usersById.set(sergeyId, {
    id: sergeyId,
    username: 'sergey',
    passwordHash: hash('password123'),
    displayName: 'Сергей',
    age: 31,
    avatar: 'https://i.pravatar.cc/200?img=33',
    quote: 'Стартапы, бег, подкасты.',
    interests: ['Москва', 'Бег', 'Путешествия', 'Поп'],
    tracks: ['Boulevard Depo', 'Scriptonite'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('sergey', sergeyId);

  usersById.set(nastyaId, {
    id: nastyaId,
    username: 'nastya',
    passwordHash: hash('password123'),
    displayName: 'Настя',
    age: 24,
    avatar: null,
    quote: 'Кофе, книги, джаз.',
    interests: ['Санкт-Петербург', 'Кино', 'Джаз', 'Путешествия'],
    tracks: ['Nujabes', 'Billie Eilish'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('nastya', nastyaId);

  usersById.set(olegId, {
    id: olegId,
    username: 'oleg',
    passwordHash: hash('password123'),
    displayName: 'Олег',
    age: 35,
    avatar: 'https://i.pravatar.cc/200?img=59',
    quote: 'Горные лыжи и рок-концерты.',
    interests: ['Казань', 'Путешествия', 'Рок', 'Футбол'],
    tracks: ['Arctic Monkeys', 'Miyagi'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('oleg', olegId);

  usersById.set(polinaId, {
    id: polinaId,
    username: 'polina',
    passwordHash: hash('password123'),
    displayName: 'Полина',
    age: 27,
    avatar: 'https://i.pravatar.cc/200?img=45',
    quote: 'Йога по утрам, сериалы по вечерам.',
    interests: ['Москва', 'Йога', 'Кино', 'Поп'],
    tracks: ['Dua Lipa', 'Ariana Grande'],
    createdAt: now(),
    deleted: false
  });
  usernameToId.set('polina', polinaId);

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

  // Анонимные чаты с другими людьми — не дублируем пару andrey+kirill (иначе два «Кирилла» в списке после раскрытия).
  chatsById.set('c2', {
    id: 'c2',
    participantIds: [andreyId, dashaId],
    isAnonymous: true,
    revealed: false,
    createdAt: threeDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: dashaId,
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
    participantIds: [andreyId, mishaId],
    isAnonymous: true,
    revealed: false,
    createdAt: eightDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: mishaId,
        text: 'Старый анонимный чат (для теста недели).',
        createdAt: eightDaysAgo
      }
    ]
  });

  chatsById.set('c7-expired', {
    id: 'c7-expired',
    participantIds: [andreyId, lenaId],
    isAnonymous: true,
    revealed: false,
    createdAt: eightDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: lenaId,
        text: 'Привет! Давно не писали — этот чат старше недели.',
        createdAt: eightDaysAgo
      },
      {
        id: 'm2',
        senderId: andreyId,
        text: 'Да, нужно решить с раскрытием.',
        createdAt: new Date(new Date(eightDaysAgo).getTime() + 3600000).toISOString()
      }
    ]
  });

  chatsById.set('c8-expired', {
    id: 'c8-expired',
    participantIds: [andreyId, olegId],
    isAnonymous: true,
    revealed: false,
    createdAt: eightDaysAgo,
    messages: [
      {
        id: 'm1',
        senderId: olegId,
        text: 'Анонимный чат с истёкшим сроком (тест).',
        createdAt: eightDaysAgo
      }
    ]
  });

  chatsById.set('c5', {
    id: 'c5',
    participantIds: [andreyId, vikaId],
    isAnonymous: false,
    revealed: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    messages: [
      {
        id: 'm1',
        senderId: vikaId,
        text: 'Привет! Как настроение?',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
      }
    ]
  });

  chatsById.set('c6', {
    id: 'c6',
    participantIds: [andreyId, sergeyId],
    isAnonymous: false,
    revealed: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    messages: [
      {
        id: 'm1',
        senderId: andreyId,
        text: 'Добрый день, увидел общие интересы.',
        createdAt: new Date(Date.now() - 86400000 * 5 + 3600000).toISOString()
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

export function sanitizeInterests(interests) {
  if (!Array.isArray(interests)) return [];
  const cleaned = interests
    .map(x => String(x).trim())
    .filter(Boolean)
    .filter(x => PRESET_INTERESTS_SET.has(x));
  return [...new Set(cleaned)];
}

export function getPresetInterests() {
  return [...PRESET_INTERESTS];
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
  chat.revealRequest = {
    status: 'accepted',
    requestedByUserId: null,
    respondedByUserId: null,
    createdAt: now(),
    respondedAt: now()
  };
  chat.awaitingAnonymousDecisionForUserId = null;
  return chat;
}

export function requestRevealChat(chatId, requesterId) {
  const chat = chatsById.get(chatId);
  if (!chat || !chat.isAnonymous || chat.revealed) return null;
  if (!chat.participantIds.includes(requesterId)) return null;
  if (chat.revealRequest?.status === 'pending') return chat;
  chat.revealRequest = {
    status: 'pending',
    requestedByUserId: requesterId,
    respondedByUserId: null,
    createdAt: now(),
    respondedAt: null
  };
  chat.awaitingAnonymousDecisionForUserId = null;
  return chat;
}

export function respondRevealRequest(chatId, responderId, accept) {
  const chat = chatsById.get(chatId);
  if (!chat || !chat.isAnonymous || chat.revealed) return null;
  if (!chat.participantIds.includes(responderId)) return null;
  if (!chat.revealRequest || chat.revealRequest.status !== 'pending') return null;
  if (chat.revealRequest.requestedByUserId === responderId) return null;

  const accepted = Boolean(accept);
  chat.revealRequest = {
    ...chat.revealRequest,
    status: accepted ? 'accepted' : 'rejected',
    respondedByUserId: responderId,
    respondedAt: now()
  };

  if (accepted) {
    chat.revealed = true;
    chat.isAnonymous = false;
    chat.awaitingAnonymousDecisionForUserId = null;
  } else {
    chat.awaitingAnonymousDecisionForUserId = chat.revealRequest.requestedByUserId;
  }
  return chat;
}

export function decideAnonymousAfterReject(chatId, requesterId, continueAnonymous) {
  const chat = chatsById.get(chatId);
  if (!chat) return { status: 'not_found', chat: null };
  if (!chat.participantIds.includes(requesterId)) return { status: 'forbidden', chat: null };
  if (chat.awaitingAnonymousDecisionForUserId !== requesterId) {
    return { status: 'no_pending_decision', chat };
  }

  if (!continueAnonymous) {
    chatsById.delete(chatId);
    return { status: 'deleted', chat: null };
  }

  chat.awaitingAnonymousDecisionForUserId = null;
  chat.revealRequest = null;
  return { status: 'continued', chat };
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
  const matches = [];
  for (const chat of chatsById.values()) {
    if (!chat.participantIds || chat.participantIds.length !== 2) continue;
    const hasA = chat.participantIds.includes(a);
    const hasB = chat.participantIds.includes(b);
    if (hasA && hasB) matches.push(chat);
  }
  if (matches.length === 0) return null;
  if (matches.length === 1) return matches[0];
  matches.sort(
    (x, y) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
  );
  return matches[0];
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
    revealRequest: null,
    awaitingAnonymousDecisionForUserId: null,
    createdAt,
    messages: []
  };
  chatsById.set(chatId, chat);
  return chat;
}
