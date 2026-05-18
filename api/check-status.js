import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    try {
        const { data, error } = await supabase
            .from('player_verification')
            .select('status')
            .eq('uid', uid)
            .single();

        if (error || !data) {
            return res.status(200).json({ status: 'not_found' });
        }

        return res.status(200).json({ status: data.status });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
