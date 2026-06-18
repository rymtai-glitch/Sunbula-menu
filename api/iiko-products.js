const https = require('https');

function post(url, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST', headers }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => resolve({ status: res.statusCode, body: raw }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.IIKO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'IIKO_API_KEY not set' });

  try {
    const auth = await post('https://api.iiko.services/api/1/access_token', { apiLogin: apiKey });
    if (auth.status !== 200) return res.status(502).json({ error: 'iiko auth failed', status: auth.status, detail: auth.body });
    const { token } = JSON.parse(auth.body);

    const orgs = await post('https://api.iiko.services/api/1/organizations', { organizationIds: null }, token);
    const orgsData = JSON.parse(orgs.body);
    const orgId = orgsData.organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No org found', orgsData });

    const menu = await post('https://api.iiko.services/api/1/nomenclature', { organizationId: orgId }, token);
    const menuData = JSON.parse(menu.body);

    const products = (menuData.products || [])
      .filter(p => !p.deleted && p.type === 'Dish')
      .map(p => ({ id: p.id, name: p.name, code: p.code }))
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ru'));

    res.status(200).json({ orgId, count: products.length, products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
