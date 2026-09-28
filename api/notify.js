// Sends guest orders and waiter calls to the staff chat.
// The bot token lives only here (Vercel env), never in the page.
const BOT_TOKEN = process.env.ORDERS_BOT_TOKEN;
const CHAT_ID = process.env.ORDERS_CHAT_ID || '-1003958886663';
const ALLOWED_ORIGINS = ['https://sunbula-menu.vercel.app', 'https://rymtai-glitch.github.io'];

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const str = (s, max) => esc(String(s ?? '').trim().slice(0, max));
const num = (n) => (Number.isFinite(Number(n)) ? Math.max(0, Math.round(Number(n))) : 0);
const price = (n) => num(n).toLocaleString('ru-RU').replace(/[\s,]/g, ' ') + ' ₸';
const time = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Almaty' });

function orderText(b) {
  const groups = Array.isArray(b.groups) ? b.groups.slice(0, 20) : [];
  const L = ['🧾 <b>НОВЫЙ ЗАКАЗ</b> — Стол №' + str(b.table, 10), ''];
  for (const g of groups) {
    const items = Array.isArray(g.items) ? g.items.slice(0, 60) : [];
    L.push('👤 <b>' + str(g.name, 40) + '</b> (' + num(g.count) + ')');
    for (const it of items) {
      L.push('   • ' + str(it.name, 80) + ' ×' + num(it.qty) + ' — ' + price(num(it.price) * num(it.qty)));
      if (it.comment && String(it.comment).trim()) L.push('     💬 ' + str(it.comment, 200));
    }
    L.push('   <i>Подытог: ' + price(g.subtotal) + '</i>', '');
  }
  if (!groups.length) return null;
  L.push('💰 <b>Итого: ' + price(b.total) + '</b>', '🕒 ' + time());
  return L.join('\n');
}

function waiterText(b) {
  return '🔔 <b>ВЫЗОВ ОФИЦИАНТА</b>\nСтол №' + str(b.table, 10) + (b.guest ? ' — ' + str(b.guest, 40) : '')
    + '\n📌 ' + str(b.label, 80) + (b.text ? '\n✍️ ' + str(b.text, 300) : '') + '\n🕒 ' + time();
}

module.exports = async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!BOT_TOKEN) return res.status(500).json({ error: 'not configured' });

  let b = req.body || {};
  if (typeof b === 'string') { try { b = JSON.parse(b); } catch { return res.status(400).json({ error: 'bad request' }); } }
  const text = b.type === 'order' ? orderText(b) : b.type === 'waiter' ? waiterText(b) : null;
  if (!text || !b.table) return res.status(400).json({ error: 'bad request' });

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text: text.slice(0, 4000), parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
