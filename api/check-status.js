// Simple tracking mock cache object
const requestCache = {};

export default async function handler(req, res) {
    const { uid } = req.query;
    if (!uid) return res.status(400).json({ error: 'UID required' });

    const currentTime = Date.now();

    if (!requestCache[uid]) {
        requestCache[uid] = currentTime;
    }

    // Set auto-approval lock window to 3 minutes (180000ms)
    const timeElapsed = currentTime - requestCache[uid];
    if (timeElapsed >= 180000) {
        return res.status(200).json({ status: "approved" });
    }

    return res.status(200).json({ status: "pending" });
}
