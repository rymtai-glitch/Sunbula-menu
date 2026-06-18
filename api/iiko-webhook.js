// Receives stop-list push from iiko iikoweb.ru
// Register this URL in iiko: Внешние заказы → sunbula-qrmenu → Подключенные точки → URI
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_ANON_KEY;

  if (!sbUrl || !sbKey) return res.status(500).json({ error: 'Supabase env vars not set' });

  const body = req.body || {};

  // Log raw payload for debugging — helps identify iiko's exact format
  await fetch(`${sbUrl}/rest/v1/webhook_log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': sbKey,
      'Authorization': `Bearer ${sbKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ body }),
  }).catch(() => {});

  // Parse stop-list items from known iiko payload formats
  const stopped = [];

  // Format A: terminalGroupStopLists (iiko Cloud API push)
  for (const tg of (body.terminalGroupStopLists || [])) {
    for (const item of (tg.items || [])) {
      stopped.push({ iiko_id: item.productId, name: item.productName || '' });
    }
  }

  // Format B: stopList wrapper
  for (const item of (body.stopList?.stopListItems || [])) {
    stopped.push({ iiko_id: item.productId || item.id, name: item.name || item.productName || '' });
  }

  // Format C: flat array
  if (Array.isArray(body.items)) {
    for (const item of body.items) {
      stopped.push({ iiko_id: item.productId || item.id, name: item.name || '' });
    }
  }

  // Replace entire stop_list table with new state
  await fetch(`${sbUrl}/rest/v1/stop_list?iiko_id=neq.null`, {
    method: 'DELETE',
    headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` },
  }).catch(() => {});

  if (stopped.length > 0) {
    await fetch(`${sbUrl}/rest/v1/stop_list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(stopped),
    }).catch(() => {});
  }

  res.status(200).json({ ok: true, received: stopped.length });
};
