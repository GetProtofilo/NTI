export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(200).send('OK');

    const body = req.body;

    if (body.callback_query) {
        const callbackData = body.callback_query.data;
        const messageId = body.callback_query.message.message_id;
        const chatId = body.callback_query.message.chat.id;

        if (callbackData.startsWith('approve_')) {
            const uidToApprove = callbackData.split('_')[1];
            const supabaseUrl = process.env.SUPABASE_URL;
            const supabaseKey = process.env.SUPABASE_KEY;

            try {
                // Direct REST API Update request to Supabase
                await fetch(`${supabaseUrl}/rest/v1/player_verification?uid=eq.${uidToApprove}`, {
                    method: 'PATCH',
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status: 'approved' })
                });

                // Edit Telegram notification UI element text layout seamlessly
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
