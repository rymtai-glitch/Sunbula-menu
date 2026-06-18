const apiBase = 'https://api-ru.iiko.services';

async function iikoPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch(apiBase + path, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;
  const apiKey = process.env.IIKO_API_KEY;

  const body = req.body || {};

  // Log raw payload for debugging
  if (sbUrl && sbKey) {
    await fetch(`${sbUrl}/rest/v1/webhook_log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=minimal' },
      body: JSON.stringify({ body }),
    }).catch(() => {});
  }

  // Only process StopListUpdate events
  const events = Array.isArray(body) ? body : [body];
  const hasStopListUpdate = events.some(e => e.eventType === 'StopListUpdate');

  if (!hasStopListUpdate || !apiKey || !sbUrl || !sbKey) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  try {
    // Auth with iiko
    const { token } = await iikoPost('/api/1/access_token', { apiLogin: apiKey });
    if (!token) return res.status(200).json({ ok: false, error: 'No token from iiko' });

    // Get org ID
    const orgs = await iikoPost('/api/1/organizations', { organizationIds: null }, token);
    const orgId = orgs.organizations?.[0]?.id;
    if (!orgId) return res.status(200).json({ ok: false, error: 'No org found' });

    // Get current stop list
    const stopData = await iikoPost('/api/1/stop_lists', { organizationIds: [orgId] }, token);

    // Collect all stopped product IDs
    const stopped = [];
    for (const tg of (stopData.terminalGroupStopLists || [])) {
      for (const item of (tg.items || [])) {
        stopped.push({ iiko_id: item.productId, name: item.productName || '' });
      }
    }

    // Replace stop_list table
    await fetch(`${sbUrl}/rest/v1/stop_list?iiko_id=neq.null`, {
      method: 'DELETE',
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` },
    }).catch(() => {});

    if (stopped.length > 0) {
      await fetch(`${sbUrl}/rest/v1/stop_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=minimal' },
        body: JSON.stringify(stopped),
      }).catch(() => {});
    }

    res.status(200).json({ ok: true, stopped: stopped.length });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
};
