import { Router } from 'express';
import { getSupabase } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const supabase = getSupabase();

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'All fields required' });
  }

  if (!supabase) {
    return res.status(503).json({ message: 'Database unavailable' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: userId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        created_at: new Date().toISOString()
      }])
      .select('id, name, email')
      .single();

    if (error) throw error;
    const token = signToken(data);
    res.status(201).json({ user: data, token });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const supabase = getSupabase();

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  if (!supabase) {
    return res.status(503).json({ message: 'Database unavailable' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    const { password: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
});

export default router;
