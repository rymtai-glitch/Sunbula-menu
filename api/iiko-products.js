const apiBase = 'https://api-ru.iiko.services';

async function iikoPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch(apiBase + path, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await r.text();
  return { status: r.status, data: JSON.parse(text) };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.IIKO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'IIKO_API_KEY not set' });

  try {
    const auth = await iikoPost('/api/v2/access_token', { apiLogin: process.env.IIKO_API_LOGIN || 'sunbula-qrmenu', clientSecret: apiKey });
    if (auth.status !== 200) return res.status(502).json({ error: 'iiko auth failed', status: auth.status, detail: auth.data });
    const { token } = auth.data;

    const orgs = await iikoPost('/api/1/organizations', { organizationIds: null }, token);
    const orgId = orgs.data.organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No org found', orgs: orgs.data });

    const menu = await iikoPost('/api/1/nomenclature', { organizationId: orgId }, token);

    const products = (menu.data.products || [])
      .filter(p => !p.deleted && p.type === 'Dish')
      .map(p => ({ id: p.id, name: p.name, code: p.code }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'));

    res.status(200).json({ orgId, count: products.length, products });
  } catch (e) {
    res.status(500).json({ error: e.message, cause: e.cause?.message || null });
  }
};
