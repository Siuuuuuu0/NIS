import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createUser, getUserByUsername, publicUser } from '../db/store.js';

const router = Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Нужны username и password' });
  }
  const user = createUser({ username, password });
  if (!user) {
    return res.status(409).json({ error: 'Пользователь уже существует' });
  }
  const token = signToken(user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Нужны username и password' });
  }
  const user = getUserByUsername(username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  const token = signToken(user.id);
  res.json({ token, user: publicUser(user) });
});

export default router;
