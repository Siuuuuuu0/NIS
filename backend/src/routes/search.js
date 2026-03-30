import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  listUsers,
  listChatsForUser,
  getUserById,
  createChatBetween
} from '../db/store.js';

const router = Router();

function getExcludedUserIds(meId) {
  const chats = listChatsForUser(meId);
  return new Set(
    chats
      .map(c => c.participantIds?.find(id => id !== meId))
      .filter(Boolean)
  );
}

function scoreByOverlap(me, other) {
  const meInterests = new Set(me?.interests || []);
  const meTracks = new Set(me?.tracks || []);
  let score = 0;

  for (const i of other.interests || []) {
    if (meInterests.has(i)) score += 2;
  }
  for (const t of other.tracks || []) {
    if (meTracks.has(t)) score += 3;
  }
  return score;
}

router.get('/recommendations', authRequired, (req, res) => {
  const me = getUserById(req.userId);
  const excludedIds = getExcludedUserIds(req.userId);

  const others = listUsers().filter(
    u => u.id !== req.userId && !u.deleted && !excludedIds.has(u.id)
  );

  const items = others.map(u => ({
    id: u.id,
    name: u.displayName,
    age: u.age,
    city: u.interests?.find(x => /москва|петербург|город/i.test(x)) || null,
    tags: u.interests?.filter(x => !/москва|петербург/i.test(x)).slice(0, 3) || [],
    matches: (me?.interests || []).filter(i => (u.interests || []).includes(i)).slice(0, 4),
    quote: u.quote || '',
    avatar: u.avatar,
    interests: u.interests || [],
    tracks: u.tracks || [],
    score: scoreByOverlap(me, u)
  }));

  items.sort((a, b) => b.score - a.score);
  res.json(items);
});

router.post('/users', authRequired, (req, res) => {
  const body = req.body || {};
  const text = body.text ? String(body.text).trim().toLowerCase() : '';
  const interests = Array.isArray(body.interests) ? body.interests.map(String) : [];
  const tracks = Array.isArray(body.tracks) ? body.tracks.map(String) : [];

  const excludedIds = getExcludedUserIds(req.userId);

  const selectedLabels = [...interests, ...tracks];
  const hasLabels = selectedLabels.length > 0;

  const users = listUsers()
    .filter(u => u.id !== req.userId && !excludedIds.has(u.id))
    .filter(u => {
      const matchesText =
        !text ||
        [u.displayName, u.quote, ...(u.interests || []), ...(u.tracks || [])]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(text));

      const matchesLabels =
        !hasLabels ||
        interests.some(l => (u.interests || []).includes(l)) ||
        tracks.some(t => (u.tracks || []).includes(t));

      return matchesText && matchesLabels;
    });

  const result = users.map(u => ({
    id: u.id,
    name: u.displayName,
    age: u.age,
    avatar: u.avatar,
    quote: u.quote || '',
    interests: u.interests || [],
    tracks: u.tracks || []
  }));

  res.json(result);
});

router.post('/anonymous-match', authRequired, (req, res) => {
  const body = req.body || {};
  const selectedInterests = Array.isArray(body.interests) ? body.interests.map(String) : [];
  const selectedTracks = Array.isArray(body.tracks) ? body.tracks.map(String) : [];
  const meId = req.userId;

  const excludedIds = getExcludedUserIds(meId);
  const candidates = listUsers().filter(
    u => u.id !== meId && !u.deleted && !excludedIds.has(u.id)
  );

  const scoreCandidate = u => {
    let score = 0;
    for (const i of selectedInterests) {
      if ((u.interests || []).includes(i)) score += 2;
    }
    for (const t of selectedTracks) {
      if ((u.tracks || []).includes(t)) score += 3;
    }
    return score;
  };

  const ranked = candidates
    .map(u => ({ user: u, score: scoreCandidate(u) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!ranked.length) {
    return res.status(404).json({ error: 'Не найден анонимный собеседник по выбранным фильтрам' });
  }

  const target = ranked[0].user;
  const chat = createChatBetween(meId, target.id, { anonymous: true });
  res.json({ chatId: chat.id, matchedUserId: target.id });
});

export default router;
