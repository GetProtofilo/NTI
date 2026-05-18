import { createClient } from '@supabase/supabase-js';

// Safe initialized client connection wrapper
let supabase = null;
try {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
        supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    }
} catch (e) {
    console.error("Failed to initialize Supabase client library connection instance", e);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: 'UID is required' });

    let databaseSaved = false;

    // Try logging info to your Supabase project table panel 
    if (supabase) {
        try {
            const { error } = await supabase.from('player_verification').upsert({ uid, status: 'pending' });
            if (!error) databaseSaved = true;
            else console.error("Supabase Database Row Insertion Error:", error);
        } catch (dbError) {
            console.error("Database connection block encountered:", dbError);
        }
    }

    // Build plain text fallback note if your Supabase keys break the server
    const dbStatusNote = databaseSaved ? "✅ Saved to Supabase Table" : "⚠️ DB Fail (Check keys/table names)";
    const message = `🚨 NEW SYSTEM ACCESS REQUEST\n\nUser UID: ${uid}\nDatabase Status: ${dbStatusNote}\n\nTap below to approve access instantly.`;

    try {
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: process.env.TELEGRAM_CHAT_ID,
                text: message,
                reply_markup: {
                    inline_keyboard: [[
                        { text: `✅ Approve UID: ${uid}`, callback_data: `approve_${uid}` }
                    ]]
                }
            })
        });

        const data = await response.json();
        return res.status(200).json({ success: true, telegramResponse: data });
    } catch (tgError) {
        return res.status(500).json({ error: 'Telegram dispatch framework crashed', details: tgError.message });
    }
}
