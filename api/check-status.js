export default async function handler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    try {
        // Direct API Select query to Supabase database
        const response = await fetch(`${supabaseUrl}/rest/v1/player_verification?uid=eq.${uid}&select=status`, {
            method: 'GET',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`
            }
        });

        const data = await response.json();

        if (!data || data.length === 0) {
            return res.status(200).json({ status: 'not_found' });
        }

        return res.status(200).json({ status: data[0].status });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
