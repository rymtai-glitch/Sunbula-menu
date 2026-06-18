const apiBase = 'https://api-ru.iiko.services';

async function iikoPost(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const r = await fetch(apiBase + path, { method: 'POST', headers, body: JSON.stringify(body) });
  return r.json();
}

async function sbInsert(sbUrl, sbKey, table, data) {
  return fetch(`${sbUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}`, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;
  const apiKey = process.env.IIKO_API_KEY;
  const appId = process.env.IIKO_APP_ID;

  const body = req.body || {};

  if (sbUrl && sbKey) {
    await sbInsert(sbUrl, sbKey, 'webhook_log', { body }).catch(() => {});
  }

  const events = Array.isArray(body) ? body : [body];
  const stopListEvents = events.filter(e => e.eventType === 'StopListUpdate');

  if (!stopListEvents.length || !sbUrl || !sbKey) {
    return res.status(200).json({ ok: true, skipped: true });
  }

  // Strategy 1: extract stop list inline from webhook payload (isFull: true)
  const inlineItems = [];
  for (const ev of stopListEvents) {
    for (const upd of (ev.eventInfo?.terminalGroupsStopListsUpdates || [])) {
      if (upd.isFull && Array.isArray(upd.items)) {
        for (const item of upd.items) {
          if (item.productId) {
            inlineItems.push({ iiko_id: item.productId, name: item.productName || '' });
          }
        }
      }
    }
  }

  if (inlineItems.length > 0) {
    await fetch(`${sbUrl}/rest/v1/stop_list?iiko_id=neq.null`, {
      method: 'DELETE',
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` },
    }).catch(() => {});
    if (inlineItems.length > 0) {
      await sbInsert(sbUrl, sbKey, 'stop_list', inlineItems).catch(() => {});
    }
    return res.status(200).json({ ok: true, source: 'inline', stopped: inlineItems.length });
  }

  // Strategy 2: call iiko API to get current stop list
  if (!apiKey) {
    return res.status(200).json({ ok: false, error: 'No API key, isFull was false - cannot get stop list' });
  }

  try {
    const authBody = { apiLogin: process.env.IIKO_API_LOGIN || 'sunbula-qrmenu', clientSecret: apiKey };
    if (appId) authBody.appId = appId;

    const authResp = await iikoPost('/api/v2/access_token', authBody);
    const token = authResp.token;

    if (!token) {
      await sbInsert(sbUrl, sbKey, 'webhook_log', { body: { _debug: 'auth_failed', authResp, usedAppId: appId || null } }).catch(() => {});
      return res.status(200).json({ ok: false, error: 'Auth failed', authResp });
    }

    const orgs = await iikoPost('/api/1/organizations', { organizationIds: null }, token);
    const orgId = orgs.organizations?.[0]?.id;
    if (!orgId) return res.status(200).json({ ok: false, error: 'No org found' });

    const stopData = await iikoPost('/api/1/stop_lists', { organizationIds: [orgId] }, token);

    const stopped = [];
    for (const tg of (stopData.terminalGroupStopLists || [])) {
      for (const item of (tg.items || [])) {
        stopped.push({ iiko_id: item.productId, name: item.productName || '' });
      }
    }

    await fetch(`${sbUrl}/rest/v1/stop_list?iiko_id=neq.null`, {
      method: 'DELETE',
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` },
    }).catch(() => {});

    if (stopped.length > 0) {
      await sbInsert(sbUrl, sbKey, 'stop_list', stopped).catch(() => {});
    }

    return res.status(200).json({ ok: true, source: 'api', stopped: stopped.length });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message });
  }
};
