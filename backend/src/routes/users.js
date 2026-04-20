import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import {
  getUserById,
  publicUser,
  updateUser,
  softDeleteUser,
  sanitizeInterests
} from '../db/store.js';

const router = Router();

router.get('/me', authRequired, (req, res) => {
  const u = getUserById(req.userId);
  if (!u) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(publicUser(u));
});

router.patch('/me', authRequired, (req, res) => {
  const body = req.body || {};
  const patch = {};
  if (body.displayName != null) patch.displayName = String(body.displayName);
  if (body.age != null) patch.age = Number(body.age);
  if (body.avatar !== undefined) patch.avatar = body.avatar;
  if (body.quote !== undefined) patch.quote = String(body.quote);
  if (Array.isArray(body.interests)) patch.interests = sanitizeInterests(body.interests);
  if (Array.isArray(body.tracks)) patch.tracks = body.tracks.map(String);
  const u = updateUser(req.userId, patch);
  if (!u) return res.status(404).json({ error: 'Пользователь не найден' });
  res.json(publicUser(u));
});

router.delete('/me', authRequired, (req, res) => {
  const ok = softDeleteUser(req.userId);
  if (!ok) return res.status(404).json({ error: 'Пользователь не найден' });
  res.status(204).send();
});

router.get('/:id', authRequired, (req, res) => {
  const u = getUserById(req.params.id);
  if (!u) return res.status(404).json({ error: 'Профиль не найден' });
  res.json(publicUser(u));
});

export default router;
