export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    try {
        // Upsert direct tracking call to Supabase REST API endpoint
        await fetch(`${supabaseUrl}/rest/v1/player_verification`, {
            method: 'POST',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates'
            },
            body: JSON.stringify({ uid, status: 'pending' })
        });

        // Fire notification card layout to your Telegram Bot handler
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
