import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import { initializeSupabase } from './db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const nodeEnv = process.env.NODE_ENV || 'development';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(limiter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'PromptReel API running', env: nodeEnv });
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  const statusCode = err.statusCode || 500;
  const message = nodeEnv === 'production' ? 'Internal server error' : err.message;
  res.status(statusCode).json({ message });
});

app.listen(port, () => {
  console.log(`PromptReel API listening on http://localhost:${port} [${nodeEnv}]`);
});
