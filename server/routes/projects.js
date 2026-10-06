import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { generateVideoBrief } from '../services/aiService.js';

const router = Router();

const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

router.use(requireAuth);

router.get('/', async (req, res) => {
  const db = getDb();
  const projects = db.data.projects.filter((project) => project.userId === req.user.id);
  res.json({ projects });
});

router.get('/:id', async (req, res) => {
  const db = getDb();
  const project = db.data.projects.find((entry) => entry.id === req.params.id && entry.userId === req.user.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json({ project });
});

router.post('/generate', async (req, res) => {
  const { prompt, platform, style } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  try {
    const brief = await generateVideoBrief({ prompt: prompt.trim(), platform, style });
    const db = getDb();
    const project = {
      id: uuidv4(),
      userId: req.user.id,
      name: `${(platform || 'instagram').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      prompt: prompt.trim(),
      platform: platform || 'instagram',
      style: style || 'cinematic',
      views: brief.views || Math.floor(Math.random() * 3000) + 500,
      createdAt: new Date().toISOString(),
      cover: brief.cover || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      script: brief.script || {
        style: style || 'cinematic',
        prompt: prompt.trim(),
        scenes: brief.scenes || ['Scene 1', 'Scene 2', 'Scene 3'],
        hook: brief.hook || 'Start with the strongest visual detail.',
        cta: brief.cta || 'Follow for more ideas.'
      },
      brief: brief,
      status: 'ready'
    };

    db.data.projects.unshift(project);
    await db.write();

    res.status(201).json({ project });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to generate video brief' });
  }
});

export default router;
