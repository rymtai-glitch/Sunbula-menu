const apiBase = 'https://api.iiko.services';

async function iikoPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch(apiBase + path, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.IIKO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'IIKO_API_KEY not set' });

  try {
    const { token } = await iikoPost('/api/1/access_token', { apiLogin: apiKey });
    const orgs = await iikoPost('/api/1/organizations', { organizationIds: null }, token);
    const orgId = orgs.organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No org found' });

    const stopData = await iikoPost('/api/1/stop_lists', { organizationIds: [orgId] }, token);

    const stoppedIikoIds = [];
    for (const tg of (stopData.terminalGroupStopLists || [])) {
      for (const item of (tg.items || [])) {
        if (!stoppedIikoIds.includes(item.productId)) stoppedIikoIds.push(item.productId);
      }
    }

    res.status(200).json({ stoppedIikoIds, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
