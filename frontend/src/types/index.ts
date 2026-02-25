export interface IUser {
    _id: string;
    name: string;
    email: string;
    phone: string;
    telegramUserId?: string;
    telegramUsername?: string;
    role: 'operator' | 'admin';
    createdAt: string;
}

export interface IUpdate {
    _id: string;
    userId: string;
    mediaType: 'voice' | 'video';
    transcript: string;
    summary: string;
    topic: string;
    durationSeconds?: number;
    senderName: string;
    senderTelegramUsername?: string;
    createdAt: string;
}
