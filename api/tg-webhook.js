import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    const body = req.body;

    // Check if this is a button click (callback_query) from you
    if (body.callback_query) {
        const callbackData = body.callback_query.data; // e.g., "approve_861892"
        const messageId = body.callback_query.message.message_id;
        const chatId = body.callback_query.message.chat.id;

        if (callbackData.startsWith('approve_')) {
            const uidToApprove = callbackData.split('_')[1];

            try {
                // 1. Update the database record to approved
                await supabase
                    .from('player_verification')
                    .update({ status: 'approved' })
                    .eq('uid', uidToApprove);

                // 2. Edit the Telegram message text so you know it worked
                const editUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/editMessageText`;
                await fetch(editUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: chatId,
                        message_id: messageId,
                        text: `✅ *UID Approved Successfully!*\n\nUser UID \`${uidToApprove}\` now has full access to the live dashboard.`,
                        parse_mode: 'Markdown'
                    })
                });
            } catch (err) {
                console.error(err);
            }
        }
    }

    return res.status(200).send('OK');
}
