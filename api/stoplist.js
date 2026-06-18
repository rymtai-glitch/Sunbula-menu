// Returns stopped menu item iiko IDs from Supabase (populated by iiko-webhook.js)
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;

  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env vars not set' });

  try {
    const r = await fetch(`${sbUrl}/rest/v1/stop_list?select=iiko_id,name`, {
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` },
    });
    const items = await r.json();
    const stoppedIikoIds = (items || []).map(i => i.iiko_id);
    res.status(200).json({ stoppedIikoIds, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
