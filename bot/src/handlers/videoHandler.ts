import { Context } from 'grammy';
import { transcribeAudio } from '../services/transcriber';
import { summarize } from '../services/summarizer';
import { downloadFile, deleteFile } from '../services/fileManager';
import apiClient from '../apiClient';
import { config } from '../config';

export const handleVideo = async (ctx: Context) => {
    const video = ctx.message?.video || ctx.message?.video_note;
    if (!video) return;

    const fileId = video.file_id;
    const fileName = `${ctx.message?.message_id}.mp4`;

    try {
        const file = await ctx.api.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${config.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

        // 1. Download
        const filePath = await downloadFile(fileUrl, fileName);

        // 2. Transcribe
        const transcript = await transcribeAudio(filePath);

        // 3. Summarize
        const { summary, topic } = await summarize(transcript);

        // 4. Save to Backend
        try {
            const response = await apiClient.post('/api/updates', {
                telegramUserId: String(ctx.from?.id),
                telegramMessageId: String(ctx.message?.message_id),
                telegramChatId: String(ctx.chat?.id),
                mediaType: 'video',
                transcript,
                summary,
                topic,
                durationSeconds: video.duration,
                senderName: ctx.from?.first_name || 'Unknown',
                senderTelegramUsername: ctx.from?.username,
            });

            const updateId = response.data._id;
            const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;

            // 5. Reply in group
            await ctx.reply(
                `🎥 *Update from ${username}*\n\n` +
                `📋 *Summary:* ${summary}\n\n` +
                `📝 *Transcript:*\n"${transcript}"\n\n` +
                `🔗 [View Update](${config.FRONTEND_URL}/dashboard/updates/${updateId})`,
                { parse_mode: 'Markdown' }
            );

        } catch (error: any) {
            if (error.response?.status === 404) {
                const username = ctx.from?.username ? `@${ctx.from.username}` : ctx.from?.first_name;
                await ctx.reply(
                    `⚠️ ${username}, your Telegram is not linked to a VoiceOps account yet.\n` +
                    `Go to ${config.FRONTEND_URL}/profile to link your account.`
                );
            } else {
                console.error('Error saving update:', error);
            }
        }

        // 6. Cleanup
        deleteFile(filePath);

    } catch (error) {
        console.error('Video processing error:', error);
    }
};
