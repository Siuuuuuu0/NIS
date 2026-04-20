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

function overlapItems(a, b) {
  const left = new Set(Array.isArray(a) ? a : []);
  const right = new Set(Array.isArray(b) ? b : []);
  const overlap = [];
  for (const item of left) {
    if (right.has(item)) overlap.push(item);
  }
  return overlap;
}

function isTextMatched(user, text) {
  if (!text) return true;
  return [user.displayName, user.quote, ...(user.interests || []), ...(user.tracks || [])]
    .filter(Boolean)
    .some(v => String(v).toLowerCase().includes(text));
}

function buildSimilarity(me, other, selectedInterests = [], selectedTracks = [], text = '') {
  const commonInterests = overlapItems(me?.interests || [], other?.interests || []);
  const commonTracks = overlapItems(me?.tracks || [], other?.tracks || []);
  const selectedInterestOverlap = overlapItems(selectedInterests, other?.interests || []);
  const selectedTrackOverlap = overlapItems(selectedTracks, other?.tracks || []);
  const textBoost = text && isTextMatched(other, text) ? 2 : 0;

  const score =
    commonInterests.length * 3 +
    commonTracks.length * 4 +
    selectedInterestOverlap.length * 2 +
    selectedTrackOverlap.length * 3 +
    textBoost;

  const mePotential = (me?.interests?.length || 0) * 3 + (me?.tracks?.length || 0) * 4;
  const selectionPotential = selectedInterests.length * 2 + selectedTracks.length * 3;
  const maxScore = Math.max(mePotential + selectionPotential + (text ? 2 : 0), 1);
  const similarityPercent = Math.min(100, Math.round((score / maxScore) * 100));

  return {
    score,
    similarityPercent,
    commonInterests,
    commonTracks
  };
}

router.get('/recommendations', authRequired, (req, res) => {
  const me = getUserById(req.userId);
  const excludedIds = getExcludedUserIds(req.userId);

  const others = listUsers().filter(
    u => u.id !== req.userId && !u.deleted && !excludedIds.has(u.id)
  );

  const items = others.map(u => {
    const similarity = buildSimilarity(me, u);
    return {
      id: u.id,
      name: u.displayName,
      age: u.age,
      city: u.interests?.find(x => /москва|петербург|город/i.test(x)) || null,
      tags: u.interests?.filter(x => !/москва|петербург/i.test(x)).slice(0, 3) || [],
      matches: similarity.commonInterests.slice(0, 4),
      quote: u.quote || '',
      avatar: u.avatar,
      interests: u.interests || [],
      tracks: u.tracks || [],
      similarityPercent: similarity.similarityPercent,
      score: similarity.score
    };
  });

  items.sort((a, b) => b.score - a.score);
  res.json(items);
});

router.post('/users', authRequired, (req, res) => {
  const body = req.body || {};
  const text = body.text ? String(body.text).trim().toLowerCase() : '';
  const interests = Array.isArray(body.interests) ? body.interests.map(String) : [];
  const tracks = Array.isArray(body.tracks) ? body.tracks.map(String) : [];
  const me = getUserById(req.userId);

  const excludedIds = getExcludedUserIds(req.userId);

  const users = listUsers()
    .filter(u => u.id !== req.userId && !u.deleted && !excludedIds.has(u.id))
    .filter(u => isTextMatched(u, text))
    .map(u => {
      const similarity = buildSimilarity(me, u, interests, tracks, text);
      return {
        id: u.id,
        name: u.displayName,
        age: u.age,
        avatar: u.avatar,
        quote: u.quote || '',
        interests: u.interests || [],
        tracks: u.tracks || [],
        similarityPercent: similarity.similarityPercent,
        score: similarity.score,
        commonInterests: similarity.commonInterests.slice(0, 4)
      };
    })
    .sort((a, b) => b.score - a.score);

  res.json(users);
});

router.post('/anonymous-match', authRequired, (req, res) => {
  const body = req.body || {};
  const selectedInterests = Array.isArray(body.interests) ? body.interests.map(String) : [];
  const selectedTracks = Array.isArray(body.tracks) ? body.tracks.map(String) : [];
  const meId = req.userId;
  const me = getUserById(meId);

  const excludedIds = getExcludedUserIds(meId);
  const candidates = listUsers().filter(
    u => u.id !== meId && !u.deleted && !excludedIds.has(u.id)
  );

  const ranked = candidates
    .map(u => ({ user: u, ...buildSimilarity(me, u, selectedInterests, selectedTracks) }))
    .sort((a, b) => b.score - a.score || b.similarityPercent - a.similarityPercent);

  if (!ranked.length) {
    return res.status(404).json({ error: 'Не найден анонимный собеседник по выбранным фильтрам' });
  }

  const target = ranked[0].user;
  const chat = createChatBetween(meId, target.id, { anonymous: true });
  res.json({
    chatId: chat.id,
    matchedUserId: target.id,
    similarityPercent: ranked[0].similarityPercent
  });
});

export default router;
