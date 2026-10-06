import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db.js';

const router = Router();

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const db = getDb();
  const existing = db.data.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  db.data.users.push(user);
  await db.write();

  const { password: _password, ...safeUser } = user;
  const token = signToken(safeUser);

  res.status(201).json({ user: safeUser, token });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const db = getDb();
  const user = db.data.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { password: _password, ...safeUser } = user;
  const token = signToken(safeUser);

  res.json({ user: safeUser, token });
});

export default router;
