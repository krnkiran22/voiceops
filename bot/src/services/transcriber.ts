import fs from 'fs';
import OpenAI from 'openai';
import { config } from '../config';

const openai = new OpenAI({
    apiKey: config.OPENAI_API_KEY,
});

export async function transcribeAudio(filePath: string): Promise<string> {
    const response = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file: fs.createReadStream(filePath),
    });

    return response.text;
}
