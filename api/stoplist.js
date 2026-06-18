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
  res.setHeader('Cache-Control', 'no-store');

  const apiKey = process.env.IIKO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'IIKO_API_KEY not set' });

  try {
    const auth = await post('https://api.iiko.services/api/1/access_token', { apiLogin: apiKey });
    if (auth.status !== 200) return res.status(502).json({ error: 'iiko auth failed', status: auth.status, detail: auth.body });
    const { token } = JSON.parse(auth.body);

    const orgs = await post('https://api.iiko.services/api/1/organizations', { organizationIds: null }, token);
    const orgId = JSON.parse(orgs.body).organizations?.[0]?.id;
    if (!orgId) return res.status(502).json({ error: 'No org found' });

    const stop = await post('https://api.iiko.services/api/1/stop_lists', { organizationIds: [orgId] }, token);
    const stopData = JSON.parse(stop.body);

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
