// app/main.jsx — Sunbula app shell: state, navigation, per-guest table orders, checkout, tweaks
const { useState: uS, useEffect: uE, useRef: uR } = React;

const BOT_TOKEN = '8887485175:AAHHzVqYEckiiW-91xomf9VB6LkPkWsAo1o';
const CHAT_ID = '-1003958886663';
async function tgSend(text) {
  try {
    const r = await fetch('https://api.telegram.org/bot' + BOT_TOKEN + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML', disable_web_page_preview: true }),
    });
    return r.ok;
  } catch (e) { return false; }
}
const tgTime = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0250ce",
  "cta": "#0250ce",
  "pop": "#FFE000",
  "radius": 20,
  "lang": "ru"
}/*EDITMODE-END*/;

// ─── Cart persistence (localStorage, 3-hour TTL per table) ───
const CART_TTL = 3 * 60 * 60 * 1000;
function cartKey(tb) { return 'sb_cart_t' + tb; }
function loadCart(tb) {
  try {
    const raw = localStorage.getItem(cartKey(tb));
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (Date.now() - d.ts > CART_TTL) { localStorage.removeItem(cartKey(tb)); return null; }
    return d;
  } catch { return null; }
}
function saveCart(tb, orders, currentUser, screen, lang) {
  try { localStorage.setItem(cartKey(tb), JSON.stringify({ ts: Date.now(), orders, currentUser, screen, lang })); } catch {}
}
function clearCart(tb) { try { localStorage.removeItem(cartKey(tb)); } catch {} }

// ─── Order history (per table, newest first, max 20) ───
function histKey(tb) { return 'sb_history_t' + tb; }
function loadHistory(tb) { try { return JSON.parse(localStorage.getItem(histKey(tb)) || '[]'); } catch { return []; } }
function pushHistory(tb, entry) {
  try {
    const h = loadHistory(tb);
    h.unshift(entry);
    localStorage.setItem(histKey(tb), JSON.stringify(h.slice(0, 20)));
  } catch {}
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const table = React.useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return parseInt(p.get('table')) || 1;
  }, []);
  const _saved = React.useMemo(() => loadCart(table), [table]);

  const [screen, setScreen] = uS(_saved ? _saved.screen : 'welcome');
  const [currentUser, setCurrentUser] = uS(_saved ? _saved.currentUser : '');
  const [orders, setOrders] = uS(_saved ? _saved.orders : {});
  const [productId, setProductId] = uS(null);
  const [cartOpen, setCartOpen] = uS(false);
  const [waiterOpen, setWaiterOpen] = uS(false);
  const [success, setSuccess] = uS(null);
  const [sending, setSending] = uS(false);
  const [lang, setLang] = uS((_saved && _saved.lang) || t.lang || 'ru');
  const [loading, setLoading] = uS(false);
  const [toast, setToast] = uS({ show: false, msg: '' });
  const [modSheet, setModSheet] = uS(null);
  const [historyOpen, setHistoryOpen] = uS(false);
  const [stopList, setStopList] = uS(new Set());
  const toastTimer = uR(null);

  uE(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/stoplist');
        if (!r.ok) return;
        const { stoppedIikoIds, stoppedMenuIds } = await r.json();
        const map = window.IIKO_MAP || {};
        const stopped = new Set();
        for (const iikoId of (stoppedIikoIds || [])) {
          const menuId = map[iikoId];
          if (menuId) stopped.add(menuId);
        }
        for (const menuId of (stoppedMenuIds || [])) stopped.add(menuId);
        setStopList(stopped);
      } catch {}
    };
    load();
    const id = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const tr = lang === 'kz' ? TR.kz : lang === 'en' ? TR.en : TR.ru;

  uE(() => {
    if (screen === 'menu' || currentUser) {
      saveCart(table, orders, currentUser, screen, lang);
    }
  }, [orders, currentUser, screen, lang, table]);

  const flash = (msg) => {
    setToast({ show: true, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(s => ({ ...s, show: false })), 1900);
  };
  const findItem = (id) => { for (const c of MENU) { const i = c.items.find(x => x.id === id); if (i) return { item: i, cat: c }; } return null; };

  const changeQty = (name, id, delta) => {
    setOrders(o => {
      const u = o[name] ? { cart: { ...o[name].cart }, comments: { ...o[name].comments }, prices: { ...(o[name].prices || {}) } } : { cart: {}, comments: {}, prices: {} };
      const n = (u.cart[id] || 0) + delta;
      if (n <= 0) { delete u.cart[id]; delete u.comments[id]; delete u.prices[id]; } else u.cart[id] = n;
      return { ...o, [name]: u };
    });
  };
  const add = (id) => {
    if (stopList.has(id)) return;
    const _det = window.DETAILS && window.DETAILS[id];
    const _mods = _det ? (_det.modifiers || []) : [];
    if (_mods.length > 0) { setModSheet({ itemId: id }); return; }
    changeQty(currentUser, id, +1);
    flash(tr.addedToCart);
  };
  const inc = (id) => changeQty(currentUser, id, +1);
  const dec = (id) => changeQty(currentUser, id, -1);
  const incFor = (name, id) => changeQty(name, id, +1);
  const decFor = (name, id) => changeQty(name, id, -1);
  const setCommentFor = (name, id, v) => setOrders(o => {
    const u = o[name] ? { cart: { ...o[name].cart }, comments: { ...o[name].comments }, prices: { ...(o[name].prices || {}) } } : { cart: {}, comments: {}, prices: {} };
    u.comments[id] = v; return { ...o, [name]: u };
  });
  const setPriceFor = (name, id, price) => setOrders(o => {
    const u = o[name] ? { cart: { ...o[name].cart }, comments: { ...o[name].comments }, prices: { ...(o[name].prices || {}) } } : { cart: {}, comments: {}, prices: {} };
    if (price) u.prices[id] = price; return { ...o, [name]: u };
  });

  const myCart = (orders[currentUser] && orders[currentUser].cart) || {};

  const userTotal = (name) => Object.entries((orders[name] && orders[name].cart) || {}).reduce((s, [id, q]) => { const f = findItem(parseInt(id)); const p = (orders[name].prices || {})[id]; return s + (f ? (p || f.item.price) * q : 0); }, 0);
  const userCount = (name) => Object.values((orders[name] && orders[name].cart) || {}).reduce((a, b) => a + b, 0);
  const tableTotal = Object.keys(orders).reduce((s, n) => s + userTotal(n), 0);
  const tableCount = Object.keys(orders).reduce((s, n) => s + userCount(n), 0);

  const guestNames = Object.keys(orders).filter(n => userCount(n) > 0);
  guestNames.sort((a, b) => (a === currentUser ? -1 : b === currentUser ? 1 : 0));
  const groups = guestNames.map(name => ({
    name,
    isCurrent: name === currentUser,
    subtotal: userTotal(name),
    count: userCount(name),
    items: Object.entries(orders[name].cart).map(([id, qty]) => { const f = findItem(parseInt(id)); const priceOverride = (orders[name].prices || {})[id]; return { ...f, qty, comment: (orders[name].comments || {})[id] || '', priceOverride }; }).filter(x => x.item),
  }));

  const startName = () => setScreen('name');
  const confirmName = (name) => {
    setCurrentUser(name);
    setOrders(o => o[name] ? o : { ...o, [name]: { cart: {}, comments: {}, prices: {} } });
    setScreen('menu'); setLoading(true); setTimeout(() => setLoading(false), 850);
  };
  const openItem = (id) => setProductId(id);
  const toggleLang = () => setLang(l => l === 'ru' ? 'kz' : l === 'kz' ? 'en' : 'ru');
  const waiter = () => setWaiterOpen(true);
  const sendWaiter = (label, customText) => {
    const detail = customText ? ('\n✍️ ' + customText) : '';
    tgSend('🔔 <b>ВЫЗОВ ОФИЦИАНТА</b>\nСтол №' + table + (currentUser ? ' — ' + currentUser : '') + '\n📌 ' + label + detail + '\n🕒 ' + tgTime());
    setWaiterOpen(false);
    flash(tr.waiterReqSent);
  };
  const switchGuest = (name) => { setCurrentUser(name); flash(tr.switchedTo + ' ' + name); };
  const addGuest = (name) => {
    const nm = name.trim(); if (!nm) return;
    setOrders(o => o[nm] ? o : { ...o, [nm]: { cart: {}, comments: {} } });
    setCurrentUser(nm); setCartOpen(false);
    flash(tr.switchedTo + ' ' + nm);
  };

  const buildOrderText = () => {
    const L = [];
    L.push('🧾 <b>НОВЫЙ ЗАКАЗ</b> — Стол №' + table);
    L.push('');
    groups.forEach(g => {
      L.push('👤 <b>' + g.name + '</b> (' + g.count + ')');
      g.items.forEach(({ item, qty, comment, priceOverride }) => {
        L.push('   • ' + item.nameRu + ' \xd7' + qty + ' — ' + fmtPrice((priceOverride || item.price) * qty));
        if (comment && comment.trim()) L.push('     💬 ' + comment.trim());
      });
      L.push('   <i>Подытог: ' + fmtPrice(g.subtotal) + '</i>');
      L.push('');
    });
    L.push('💰 <b>Итого: ' + fmtPrice(tableTotal) + '</b>');
    L.push('🕒 ' + tgTime());
    return L.join('\n');
  };

  const checkout = () => {
    const snapshot = groups.map(g => ({ name: g.name, subtotal: g.subtotal, count: g.count }));
    const orderNo = 1000 + Math.floor(Math.random() * 9000);
    pushHistory(table, {
      orderNo, ts: Date.now(), table, total: tableTotal,
      items: groups.flatMap(g => g.items.map(({ item, qty, comment, priceOverride }) => ({ nameRu: item.nameRu, nameKz: item.nameKz, qty, price: priceOverride || item.price, comment }))),
    });
    tgSend(buildOrderText());
    setCartOpen(false);
    setTimeout(() => setSending(true), 280);
    setTimeout(() => {
      setSending(false);
      setSuccess({ orderNo, count: tableCount, total: tableTotal, table, guests: snapshot });
    }, 1500);
  };
  const backToMenu = () => { clearCart(table); setSuccess(null); setOrders({}); setProductId(null); };

  const themeStyle = {
    '--accent': t.accent, '--pop': t.pop, '--gold': t.pop, '--yellow': t.pop,
    '--cta': t.cta, '--cta-ink': '#FFFFFF',
    '--r': t.radius + 'px',
  };

  return (
    <div style={themeStyle}>
      <div className="sb-phone">
        {screen === 'welcome' && <Welcome t={tr} lang={lang} table={table} onOpen={startName} onSetLang={setLang} />}
        {screen === 'name' && <NameScreen t={tr} lang={lang} table={table} onConfirm={confirmName} onSetLang={setLang} />}

        {screen === 'menu' && (
          <Menu t={tr} lang={lang} table={table} currentUser={currentUser} cart={myCart}
            cartCount={tableCount} cartTotal={tableTotal} loading={loading} hidden={!!productId}
            stopList={stopList}
            onToggleLang={toggleLang} onWaiter={waiter} onOpenItem={openItem}
            onAdd={add} onInc={inc} onDec={dec} onOpenCart={() => setCartOpen(true)}
            onOpenHistory={() => setHistoryOpen(true)} />
        )}

        {productId && (
          <div className="sb-app" style={{ zIndex: 240, padding: 0 }}>
            <Product t={tr} lang={lang} itemId={productId} cart={myCart} cartCount={tableCount} cartTotal={tableTotal}
              onBack={() => setProductId(null)} onAdd={add} onInc={inc} onDec={dec}
              onOpenItem={openItem} onOpenCart={() => { setProductId(null); setCartOpen(true); }} />
          </div>
        )}

        <Cart t={tr} lang={lang} table={table} show={cartOpen} groups={groups} currentUser={currentUser}
          total={tableTotal} count={tableCount}
          onClose={() => setCartOpen(false)} onIncFor={incFor} onDecFor={decFor} onCommentFor={setCommentFor}
          onSwitchGuest={switchGuest} onAddGuest={addGuest}
          onCheckout={checkout} onWaiter={waiter} onGoMenu={() => setCartOpen(false)} />

        {sending && <Sending t={tr} />}
        {success && <Success t={tr} lang={lang} show={!!success} orderNo={success.orderNo} table={success.table} count={success.count} total={success.total} guests={success.guests} onBack={backToMenu} />}

        <WaiterSheet t={tr} table={table} currentUser={currentUser} show={waiterOpen}
          onClose={() => setWaiterOpen(false)} onSend={sendWaiter} />

        <ModifierSheet t={tr} lang={lang} itemId={modSheet && modSheet.itemId} show={!!modSheet}
          onClose={() => setModSheet(null)}
          onConfirm={(id, mod, price) => {
            changeQty(currentUser, id, +1);
            if (mod) setCommentFor(currentUser, id, mod);
            if (price) setPriceFor(currentUser, id, price);
            setModSheet(null);
            flash(tr.addedToCart);
          }} />

        <OrderHistorySheet show={historyOpen} lang={lang} table={table}
          onClose={() => setHistoryOpen(false)} />

        <Toast msg={toast.msg} show={toast.show} />
      </div>

      <TweaksPanel>
        <TweakSection label="Цвета бренда" />
        <TweakColor label="Акцент" value={t.accent}
          options={['#0250ce', '#690BA4', '#2F6BFF']}
          onChange={(v) => setTweak('accent', v)} />
        <TweakColor label="Основная кнопка" value={t.cta}
          options={['#0250ce', '#0B1020', '#690BA4']}
          onChange={(v) => setTweak('cta', v)} />
        <TweakColor label="Яркий акцент" value={t.pop}
          options={['#FFE000', '#FFFC00', '#2F6BFF']}
          onChange={(v) => setTweak('pop', v)} />
        <TweakSection label="Форма и язык" />
        <TweakSlider label="Скругление" value={t.radius} min={6} max={28} unit="px"
          onChange={(v) => setTweak('radius', v)} />
        <TweakRadio label="Язык" value={lang}
          options={['ru', 'kz', 'en']}
          onChange={(v) => { setLang(v); setTweak('lang', v); }} />
      </TweaksPanel>
    </div>
  );
}

function Sending({ t }) {
  return (
    <div className="sb-app anim-in" style={{ zIndex: 450, background: 'rgba(238,242,251,.9)', backdropFilter: 'blur(8px)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <svg width="46" height="46" viewBox="0 0 46 46">
          <circle cx="23" cy="23" r="20" fill="none" stroke="var(--line)" strokeWidth="3" />
          <circle cx="23" cy="23" r="20" fill="none" stroke="var(--blue)" strokeWidth="3" strokeLinecap="round"
            strokeDasharray="126" strokeDashoffset="94" style={{ transformOrigin: 'center', animation: 'spin .9s linear infinite' }} />
        </svg>
        <div className="eyebrow-muted">{t.orderSent}…</div>
      </div>
    </div>
  );
}

const _sty = document.createElement('style');
_sty.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
document.head.appendChild(_sty);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
