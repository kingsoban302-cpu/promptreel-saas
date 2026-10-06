import { Router } from 'express';
import { getDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

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

router.get('/', async (_req, res) => {
  const db = getDb();
  res.json({ projects: db.data.projects });
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

  const db = getDb();
  const projectId = uuidv4();
  const project = {
    id: projectId,
    userId: req.user.id,
    name: `${platform || 'instagram'}-${Date.now()}`,
    prompt: prompt.trim(),
    platform: platform || 'instagram',
    style: style || 'cinematic',
    views: 0,
    createdAt: new Date().toISOString(),
    cover: `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80`,
    script: generateScript(prompt, style),
    status: 'ready'
  };

  db.data.projects.unshift(project);
  await db.write();

  res.status(201).json({ project });
});

function generateScript(prompt, style) {
  const lines = [
    'Hook: Start with a bold statement that creates instant curiosity.',
    'Scene 1: Showcase the strongest visual detail from the prompt.',
    'Scene 2: Add motion, contrast, and a short emotional payoff.',
    'Scene 3: End on a clear CTA or brand takeaway.'
  ];

  const styleLabel = style || 'cinematic';
  return {
    style: styleLabel,
    prompt,
    shots: lines,
    hook: 'Use a quick visual reveal in the first 1.5 seconds.',
    cta: 'Follow for more creative workflows.'
  };
}

export default router;
