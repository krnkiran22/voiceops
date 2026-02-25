import { Context } from 'grammy';
import apiClient from '../apiClient';
import { config } from '../config';

export const handleStart = async (ctx: Context) => {
    await ctx.reply(
        "👋 Welcome to VoiceOps!\n\nSend voice or video messages in your group and I'll transcribe them.\n\nTo link your account, go to the web app → Profile → Link Telegram Account, then use /link <code> here."
    );
};

export const handleLink = async (ctx: Context) => {
    const code = ctx.match as string;
    if (!code) {
        return ctx.reply("❌ Please provide a code. Usage: /link 123456");
    }

    try {
        const response = await apiClient.post('/api/users/link-telegram', {
            code,
            telegramUserId: String(ctx.from?.id),
            telegramUsername: ctx.from?.username || '',
        });

        if (response.data.success) {
            await ctx.reply(`✅ Linked! Your updates will now be tracked, ${response.data.userName}.`);
        }
    } catch (error: any) {
        const message = error.response?.data?.message || "Invalid or expired code.";
        await ctx.reply(`❌ ${message} Please generate a new one in the web app.`);
    }
};

export const handleHelp = async (ctx: Context) => {
    await ctx.reply(
        "📖 *VoiceOps Help*\n\n" +
        "/start - Welcome message\n" +
        "/link <code> - Link your Telegram account\n" +
        "/help - Show this help message\n\n" +
        "Just send or forward a voice note or video message and I'll handle the rest!",
        { parse_mode: "Markdown" }
    );
};
