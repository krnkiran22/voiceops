# 🎙️ VoiceOps — Telegram Voice-to-Text Intelligence Platform

A smart Telegram bot + web dashboard built with **Next.js**, **Node.js**, and **MongoDB**.

## 🚀 Quick Setup Guide

### 1. Prerequisites
- Node.js 20+
- MongoDB (Local or Atlas)
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- OpenAI API Key

### 2. Environment Variables Setup

#### Backend (`backend/.env`)
Create a `.env` file in the `backend/` folder:
```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_string_here
JWT_EXPIRES_IN=7d
BOT_API_KEY=a_shared_secret_between_bot_and_backend
CORS_ORIGIN=http://localhost:3000
```

#### Bot (`bot/.env`)
Create a `.env` file in the `bot/` folder:
```env
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
BACKEND_API_URL=http://localhost:4000
BOT_API_KEY=must_match_backend_bot_api_key
OPENAI_API_KEY=your_openai_api_key
FRONTEND_URL=http://localhost:3000
TEMP_DIR=./temp
```

#### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 3. Running Locally

#### Using Docker (Easiest)
```bash
docker-compose up -d
```

#### Using NPM (Manual)
1. **Start MongoDB**
2. **Start Backend:**
   ```bash
   cd backend && npm install && npm run dev
   ```
3. **Start Bot:**
   ```bash
   cd bot && npm install && npm run dev
   ```
4. **Start Frontend:**
   ```bash
   cd frontend && npm install && npm run dev
   ```

### 4. Linking Your Account
1. Register on the web app at `http://localhost:3000/register`.
2. Go to your **Profile** page.
3. Click **Link Telegram Account**.
4. Copy the code (e.g., `123456`).
5. In Telegram, message your bot: `/link 123456`.
6. Start sending voice/video notes!

## 📂 Project Structure
- `bot/`: Telegram bot logic (grammy.js + OpenAI)
- `backend/`: REST API (Express + Mongoose)
- `frontend/`: Web dashboard (Next.js + Tailwind + shadcn/ui)
- `docker-compose.yml`: Local infrastructure setup
