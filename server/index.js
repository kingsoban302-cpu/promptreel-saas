import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import { initializeDb } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

initializeDb();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'PromptReel API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`PromptReel API listening on http://localhost:${port}`);
});
