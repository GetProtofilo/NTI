export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    const message = `🚨 *New Activation Request*\n\n👤 User UID: \`${uid}\` is attempting to unlock the system.\n\nCheck your partner dashboard to verify if they joined via your referral link.`;

    try {
        // Ping Telegram Bot API
        await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: telegramChatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        return res.status(200).json({ success: true, message: 'Notification broadcasted' });
    } catch (error) {
        return res.status(500).json({ error: 'Notification framework delivery failure' });
    }
}
