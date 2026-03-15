const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const SALT_ROUNDS = 10;

const users = new Map();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password, and name are required' });
  }

  if (users.has(email)) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const user = { email, name, password: hashedPassword, createdAt: new Date().toISOString() };
  users.set(email, user);

  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '24h' });

  res.status(201).json({ token, user: { email, name } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });

  res.json({ token, user: { email, name: user.name } });
});

module.exports = { router, users };
