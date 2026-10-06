# PromptReel SaaS

PromptReel is a full-stack SaaS starter for generating short-form social videos from text prompts.

## Stack
- React + Vite + Tailwind-style CSS on the frontend
- Express + JWT auth + file-based JSON persistence on the backend
- Real AI integration support through OpenAI-compatible APIs
- Landing page, auth flow, dashboard, and generator UI

## Features
- Multi-page SaaS landing experience
- User signup/login
- AI prompt-to-video script generation endpoint
- Saved projects dashboard
- Secure JWT-based API protection
- Production-ready structure for extension

## Quick start

1. Install root dependencies:
   npm install
2. Install client dependencies:
   npm --prefix client install
3. Install server dependencies:
   npm --prefix server install
4. Copy `.env.example` to `.env` and configure values.
5. Start the app:
   npm run dev

## Frontend
- Local URL: http://localhost:5173

## Backend
- API: http://localhost:5000/api

## AI setup
- Set `OPENAI_API_KEY` to a valid key to enable real AI generation.
- If the key is missing, the server uses a mock generator so local development still works.

## Notes
This app is designed as a starter SaaS project and is intentionally structured so you can extend it to real database hosting, cloud storage, and production deployment.
