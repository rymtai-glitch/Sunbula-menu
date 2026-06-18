// Vercel serverless function — fetches iiko stop list every call
// Deployed at: /api/stoplist
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');

  try {
    // 1. Get auth token (IIKO_API_KEY = the API key from iiko Cloud API settings)
    const authRes = await fetch('https://api.iiko.services/api/1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: process.env.IIKO_API_KEY }),
    });
    if (!authRes.ok) {
      const txt = await authRes.text();
      return res.status(502).json({ error: 'iiko auth failed', detail: txt });
    }
    const { token } = await authRes.json();

    // 2. Get organization ID
    const orgsRes = await fetch('https://api.iiko.services/api/1/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ organizationIds: null, returnAdditionalInfo: false, includeDisabled: false }),
    });
    const orgsData = await orgsRes.json();
    const orgId = orgsData.organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No organization found' });

    // 3. Get stop list
    const stopRes = await fetch('https://api.iiko.services/api/1/stop_lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ organizationIds: [orgId] }),
    });
    const stopData = await stopRes.json();

    // Collect all stopped product IDs across terminal groups
    const stoppedIikoIds = [];
    for (const tg of (stopData.terminalGroupStopLists || [])) {
      for (const item of (tg.items || [])) {
        if (!stoppedIikoIds.includes(item.productId)) {
          stoppedIikoIds.push(item.productId);
        }
      }
    }

    res.status(200).json({ stoppedIikoIds, updatedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
