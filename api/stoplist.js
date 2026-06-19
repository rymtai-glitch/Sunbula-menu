module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;

  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env vars not set' });

  try {
    const [iikoResp, manualResp] = await Promise.all([
      fetch(`${sbUrl}/rest/v1/stop_list?select=iiko_id`, {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
      }),
      fetch(`${sbUrl}/rest/v1/menu_stop_list?select=menu_id`, {
        headers: { apikey: sbKey, Authorization: `Bearer ${sbKey}` },
      }),
    ]);

    const iikoItems = await iikoResp.json();
    const manualItems = await manualResp.json();

    const stoppedIikoIds = (Array.isArray(iikoItems) ? iikoItems : []).map(i => i.iiko_id);
    const stoppedMenuIds = (Array.isArray(manualItems) ? manualItems : []).map(i => Number(i.menu_id));

    res.status(200).json({ stoppedIikoIds, stoppedMenuIds, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
