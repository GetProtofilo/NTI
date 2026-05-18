import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    try {
        // 1. Save or update the UID in Supabase as 'pending'
        await supabase.from('player_verification').upsert({ uid, status: 'pending' });

        // 2. Send message to your Telegram with an interactive Inline Button
        const telegramUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: `🚨 *New Access Request*\n\nUser UID: \`${uid}\` wants to unlock the predictor dashboard. Verify them on your dashboard first.`,
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [[
                        { text: `✅ Approve UID: ${uid}`, callback_data: `approve_${uid}` }
                    ]]
                }
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
