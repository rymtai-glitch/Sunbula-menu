// Helper endpoint — returns all iiko products with their IDs and names.
// Use this ONCE to build the mapping in src/data/iiko-map.js
// Open: https://your-domain.vercel.app/api/iiko-products
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.IIKO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'IIKO_API_KEY env var is not set' });

  try {
    const authRes = await fetch('https://api.iiko.services/api/1/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiLogin: apiKey }),
    });
    if (!authRes.ok) {
      const txt = await authRes.text();
      return res.status(502).json({ error: 'iiko auth failed', status: authRes.status, detail: txt });
    }
    const authData = await authRes.json();
    const token = authData.token;
    if (!token) return res.status(502).json({ error: 'No token in response', authData });

    const orgsRes = await fetch('https://api.iiko.services/api/1/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ organizationIds: null }),
    });
    const orgsData = await orgsRes.json();
    const orgId = orgsData.organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No organization found' });

    const menuRes = await fetch('https://api.iiko.services/api/1/nomenclature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ organizationId: orgId }),
    });
    const menuData = await menuRes.json();

    const products = (menuData.products || [])
      .filter(p => !p.deleted && p.type === 'Dish')
      .map(p => ({ id: p.id, name: p.name, code: p.code }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'));

    res.status(200).json({ orgId, count: products.length, products });
  } catch (e) {
    res.status(500).json({ error: e.message, cause: e.cause?.message || null });
  }
}
