import { Router } from 'express';
import { getSupabase } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { generateVideoBrief } from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.use(verifyToken);

router.get('/', async (req, res) => {
  const supabase = getSupabase();
  const userId = req.user.id;

  if (!supabase) {
    return res.status(503).json({ message: 'Database unavailable' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ projects: data || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req, res) => {
  const supabase = getSupabase();
  const userId = req.user.id;
  const projectId = req.params.id;

  if (!supabase) {
    return res.status(503).json({ message: 'Database unavailable' });
  }

  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Project not found' });
    res.json({ project: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

router.post('/generate', async (req, res) => {
  const { prompt, platform, style } = req.body;
  const supabase = getSupabase();
  const userId = req.user.id;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  if (!supabase) {
    return res.status(503).json({ message: 'Database unavailable' });
  }

  try {
    const brief = await generateVideoBrief({ prompt: prompt.trim(), platform, style });
    
    const project = {
      id: uuidv4(),
      user_id: userId,
      name: `${(platform || 'instagram').toUpperCase()}-${Date.now().toString().slice(-4)}`,
      prompt: prompt.trim(),
      platform: platform || 'instagram',
      style: style || 'cinematic',
      views: brief.views || Math.floor(Math.random() * 3000) + 500,
      cover: brief.cover || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      script: brief.script || {
        style: style || 'cinematic',
        scenes: brief.scenes || ['Scene 1', 'Scene 2', 'Scene 3'],
        hook: brief.hook || 'Start with impact.',
        cta: brief.cta || 'Follow for more.'
      },
      brief: brief,
      status: 'ready',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ project: data });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to generate brief' });
  }
});

export default router;
