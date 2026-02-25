import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:4000',
    BOT_API_KEY: process.env.BOT_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '', // Your Groq or OpenAI key
    AI_BASE_URL: process.env.AI_BASE_URL || 'https://api.openai.com/v1',
    AI_MODEL: process.env.AI_MODEL || 'gpt-4o-mini',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
    TEMP_DIR: process.env.TEMP_DIR || path.join(process.cwd(), 'temp'),
};
