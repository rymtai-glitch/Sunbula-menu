// app/screens2.jsx — Product page, Cart sheet, Order success
const { useState: useS2, useEffect: useE2, useRef: useR2 } = React;

function Product({ t, lang, itemId, cart, onBack, onAdd, onInc, onDec, onOpenItem, onOpenCart, cartCount, cartTotal }) {
  const [shot, setShot] = useS2(0);
  useE2(() => { setShot(0); }, [itemId]);

  let item, cat;
  for (const c of MENU) { const f = c.items.find(i => i.id === itemId); if (f) { item = f; cat = c; break; } }
  if (!item) return null;

  const det = (window.DETAILS && window.DETAILS[item.id]) || null;
  const name = nameFor(item, lang);
  const shortDesc = descFor(item, lang);
  const fullDesc = det ? (det.desc[lang] || det.desc.ru) : (shortDesc + (lang === 'en' ? '. Made from quality ingredients and served fresh.' : lang === 'ru' ? '. Готовится из отборных продуктов и подаётся свежим.' : '. Таңдаулы өнімдерден дайындалады.'));
  const qty = cart[item.id] || 0;
  const [kcal, prot, fat, carb] = det ? det.nutri : item.nutri;
  const compose = det ? det.compose : null;
  const pairs = ((window.PAIRINGS && window.PAIRINGS[item.id]) || []).map(id => {
    for (const c of MENU) { const f = c.items.find(i => i.id === id); if (f) return { ...f, _tone: c.tone, _cid: c.id }; }
    return null;
  }).filter(Boolean);

  const nutri = [[kcal, t.kcal], [prot + t.g, t.prot], [fat + t.g, t.fat], [carb + t.g, t.carb]];

  return (
    <div className="sb-app">
      <div className="sb-scroll" style={{ paddingBottom: 110 }}>
        <div style={{ position: 'relative' }}>
          <Photo tone={cat.tone} icon={catIconName[cat.id]} src={photoFor(item.id)} big style={{ height: 380, borderRadius: 0 }} />
          <div style={{ position: 'absolute', top: 56, left: 18, right: 18, display: 'flex', justifyContent: 'space-between', zIndex: 4 }}>
            <button onClick={onBack} aria-label="back" style={glassBtn}><Icon name="back" size={20} /></button>
            {cartCount > 0 && (
              <button onClick={onOpenCart} aria-label="cart" style={{ ...glassBtn, width: 'auto', padding: '0 16px', gap: 8 }}>
                <Icon name="bag" size={17} /><span style={{ fontSize: 13, fontWeight: 700 }}>{cartCount}</span>
              </button>
            )}
          </div>
          {item.isNew && <span className="tag-new" style={{ top: 110, left: 20 }}>New</span>}
          <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, display: 'flex', gap: 8, justifyContent: 'center', zIndex: 4 }}>
            {[0, 1, 2].map(i => (
              <button key={i} onClick={() => setShot(i)} aria-label={'shot ' + i} style={{
                width: shot === i ? 26 : 8, height: 8, borderRadius: 20, border: 'none', cursor: 'pointer',
                background: shot === i ? 'var(--blue)' : 'rgba(2,80,206,.28)', transition: 'all .3s var(--ease)',
              }} />
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--ivory)', borderRadius: '26px 26px 0 0', marginTop: -26, position: 'relative', zIndex: 3, padding: '26px 22px 0' }}>
          <div className="eyebrow" style={{ marginBottom: 9 }}>{nameFor(cat, lang)}</div>
          <div className="serif" style={{ fontSize: 33, lineHeight: 1.05 }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 12 }}>
            <span className="price" style={{ fontSize: 23 }}>{fmtPrice(item.price)}</span>
            <span className="eyebrow-muted">{t.perServing}</span>
          </div>

          <p style={{ marginTop: 18, fontSize: 14.5, lineHeight: 1.7, color: 'var(--navy-70)', fontWeight: 400 }}>
            {fullDesc}
          </p>

          <div style={{ marginTop: 22 }}>
            <div className="eyebrow-muted" style={{ marginBottom: 12 }}>{t.nutri}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
              {nutri.map(([v, l], i) => (
                <div key={i} style={{ background: 'var(--paper)', borderRadius: 14, padding: '13px 8px', textAlign: 'center', boxShadow: 'var(--shadow-soft)' }}>
                  <div className="serif" style={{ fontSize: 21, color: 'var(--navy)' }}>{v}</div>
                  <div style={{ fontSize: 9.5, color: 'var(--navy-55)', fontWeight: 600, letterSpacing: '.5px', marginTop: 3, textTransform: 'lowercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            <div className="eyebrow-muted" style={{ marginBottom: 12 }}>{t.compose}</div>
            {compose ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {compose.map((ing, i) => (
                  <span key={i} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--navy-70)', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 30, padding: '7px 13px' }}>{ing}</span>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13.5, lineHeight: 1.65, color: 'var(--navy-70)' }}>{shortDesc}.</p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, color: 'var(--navy-38)' }}>
              <Icon name="leaf" size={15} sw={1.5} />
              <span style={{ fontSize: 11.5, fontWeight: 500 }}>{t.ingredientsNote}</span>
            </div>
          </div>

          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid var(--line)' }}>
            <div className="serif" style={{ fontSize: 22, marginBottom: 4 }}>{t.pairWith}</div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', margin: '14px -22px 0', padding: '0 22px 6px' }}>
              {pairs.map(r => {
                const rt = r._tone || cat.tone; const rc = r._cid || cat.id;
                return (
                  <div key={r.id} onClick={() => onOpenItem(r.id)} style={{ width: 134, flexShrink: 0, cursor: 'pointer' }}>
                    <Photo tone={rt} icon={catIconName[rc]} src={photoFor(r.id)} style={{ height: 96, borderRadius: 16 }} />
                    <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 8, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{nameFor(r, lang)}</div>
                    <div className="price" style={{ fontSize: 13, marginTop: 4 }}>{fmtPrice(r.price)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="floatbar" style={{ background: 'linear-gradient(to top, var(--ivory) 65%, rgba(247,243,236,0))' }}>
        {qty === 0 ? (
          <button className="btn btn-cta" onClick={() => onAdd(item.id)} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Icon name="plus" size={18} sw={2} />{t.toCart}</span>
            <span>{fmtPrice(item.price)}</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>
            <div className="qty" style={{ padding: 5, borderRadius: 'var(--r-sm)', background: 'var(--paper)' }}>
              <button onClick={() => onDec(item.id)} style={{ width: 38, height: 38 }}><Icon name="minus" size={16} sw={2} /></button>
              <span className="n" style={{ minWidth: 28, fontSize: 15 }}>{qty}</span>
              <button onClick={() => onInc(item.id)} style={{ width: 38, height: 38 }}><Icon name="plus" size={16} sw={2} /></button>
            </div>
            <button className="btn btn-cta" onClick={onOpenCart} style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
              <span>{t.cart}</span><span>{fmtPrice(cartTotal)}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
const glassBtn = {
  width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(2,80,206,.14)',
  background: 'rgba(255,255,255,.86)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--blue)',
  boxShadow: '0 4px 14px rgba(2,80,206,.14)',
};

function Cart({ t, lang, table, show, groups, currentUser, total, count,
  onClose, onIncFor, onDecFor, onCommentFor, onSwitchGuest, onAddGuest, onCheckout, onWaiter, onGoMenu }) {
  const [guestInput, setGuestInput] = React.useState(null);
  return (
    <div className={'overlay' + (show ? ' show' : '')} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="grab" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 4px' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>{t.table} № {table}</div>
            <div className="serif" style={{ fontSize: 28 }}>{t.cart}</div>
          </div>
          <button onClick={onClose} aria-label="close" style={{ width: 38, height: 38, borderRadius: '50%', border: '1.3px solid var(--line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--navy)' }}><Icon name="close" size={18} /></button>
        </div>

        {count === 0 ? (
          <EmptyState icon="bag" title={t.empty} sub={t.emptySub}
            action={<button className="btn btn-ghost" style={{ marginTop: 22 }} onClick={onGoMenu}>{t.orderMore}</button>} />
        ) : (
          <>
            <div className="sb-scroll" style={{ padding: '10px 18px 6px' }}>
              {groups.map((g) => (
                <div key={g.name} style={{ marginBottom: 16 }}>
                  <div onClick={() => !g.isCurrent && onSwitchGuest(g.name)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14,
                      background: g.isCurrent ? 'var(--blue-tint)' : 'var(--paper)', border: '1px solid var(--line)',
                      cursor: g.isCurrent ? 'default' : 'pointer' }}>
                    <span style={{ width: 30, height: 30, borderRadius: '50%', background: g.isCurrent ? 'var(--blue)' : 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{(g.name[0] || '?').toUpperCase()}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{g.name}</span>
                        {g.isCurrent && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.5px', textTransform: 'uppercase', color: 'var(--blue)', background: '#fff', borderRadius: 20, padding: '2px 7px' }}>{t.you}</span>}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--navy-55)', fontWeight: 600 }}>{g.count} {t.items}</div>
                    </div>
                    <span className="price" style={{ fontSize: 14, color: 'var(--blue)' }}>{fmtPrice(g.subtotal)}</span>
                  </div>
                  <div style={{ padding: '2px 4px 0' }}>
                    {g.items.map(({ item, cat, qty, comment, priceOverride }) => (
                      <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--line-soft)' }}>
                        <Photo tone={cat.tone} icon={catIconName[cat.id]} src={photoFor(item.id)} style={{ width: 54, height: 54, flexShrink: 0 }} radius="12px" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{nameFor(item, lang)}</div>
                          <div className="price" style={{ fontSize: 12, color: 'var(--navy-55)', fontWeight: 600, marginTop: 2 }}>{fmtPrice(priceOverride || item.price)}</div>
                          <input value={comment} onChange={(e) => onCommentFor(g.name, item.id, e.target.value)}
                            placeholder={lang === 'en' ? 'Special request…' : lang === 'ru' ? 'Пожелание к блюду…' : 'Тілек…'}
                            style={{ marginTop: 6, width: '100%', border: 'none', borderBottom: '1px solid var(--line)', background: 'transparent', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--navy)', padding: '3px 0', outline: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                          <span className="price" style={{ fontSize: 13.5 }}>{fmtPrice((priceOverride || item.price) * qty)}</span>
                          <AddControl qty={qty} onInc={() => onIncFor(g.name, item.id)} onDec={() => onDecFor(g.name, item.id)} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {guestInput === null ? (
                <button onClick={() => setGuestInput('')} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', margin: '4px 0', padding: '13px 14px', background: 'transparent', border: '1.5px dashed var(--line)', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--blue)' }}>
                  <Icon name="plus" size={17} sw={2} /><span style={{ fontSize: 13.5, fontWeight: 700 }}>{t.addGuest}</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: 8, margin: '4px 0' }}>
                  <input autoFocus value={guestInput} onChange={(e) => setGuestInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && guestInput.trim()) { onAddGuest(guestInput); setGuestInput(null); } }}
                    placeholder={t.guestName}
                    style={{ flex: 1, border: '1.5px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 14px', fontFamily: 'var(--sans)', fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', outline: 'none', background: 'var(--paper)' }} />
                  <button onClick={() => { if (guestInput.trim()) { onAddGuest(guestInput); setGuestInput(null); } }} className="btn" style={{ background: 'var(--blue)', color: '#fff', borderRadius: 'var(--r-sm)', padding: '0 16px', fontWeight: 800 }}><Icon name="check" size={18} sw={2.4} /></button>
                </div>
              )}

              <button onClick={onWaiter} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', margin: '8px 0 4px', padding: '13px 14px', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', cursor: 'pointer', color: 'var(--navy)' }}>
                <Icon name="bell" size={18} /><span style={{ fontSize: 13.5, fontWeight: 700 }}>{t.waiter}</span>
              </button>
            </div>

            <div style={{ padding: '14px 22px calc(18px + 14px)', borderTop: '1px solid var(--line)', background: 'var(--ivory)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800 }}>{t.total}</div>
                  <div style={{ fontSize: 11, color: 'var(--navy-55)', fontWeight: 600, marginTop: 2 }}>{count} {t.items} · {t.table} № {table}</div>
                </div>
                <span className="serif" style={{ fontSize: 30, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{fmtPrice(total)}</span>
              </div>
              <button className="btn btn-cta" onClick={onCheckout}>{t.checkout}<Icon name="arrow" size={18} sw={2.2} /></button>
              <div className="eyebrow-muted" style={{ textAlign: 'center', marginTop: 12 }}>{t.payNote}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Success({ t, lang, show, orderNo, table, count, total, guests, onBack }) {
  if (!show) return null;
  return (
    <div className="sb-app anim-in" style={{ zIndex: 500, alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
      <div className="sb-scroll" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flex: 'none', maxHeight: '100%', paddingTop: 64, paddingBottom: 40 }}>
        <div style={{ position: 'relative', width: 104, height: 104, marginBottom: 26 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--yellow)', animation: 'ringPulse 1.6s var(--ease) .3s infinite' }} />
          <svg width="104" height="104" viewBox="0 0 104 104">
            <circle cx="52" cy="52" r="48" fill="none" stroke="var(--blue)" strokeWidth="2"
              strokeDasharray="302" strokeDashoffset="302" style={{ animation: 'drawCircle .7s var(--ease) .1s forwards' }} />
            <circle cx="52" cy="52" r="48" fill="var(--blue)" opacity="1" />
            <path d="M34 53l13 13 24-26" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="70" strokeDashoffset="70" style={{ animation: 'drawCheck .5s var(--ease) .55s forwards' }} />
          </svg>
        </div>
        <div className="anim-up" style={{ animationDelay: '.4s' }}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>Sunbula</div>
          <div className="serif" style={{ fontSize: 36, lineHeight: 1.05 }}>{t.orderSent}</div>
          <p style={{ marginTop: 14, fontSize: 14, lineHeight: 1.65, color: 'var(--navy-55)', maxWidth: 290 }}>{t.orderSentSub}</p>
        </div>

        <div className="anim-up" style={{ animationDelay: '.55s', width: '100%', maxWidth: 320, marginTop: 26, background: 'var(--paper)', borderRadius: 'var(--r)', padding: '18px 20px', boxShadow: 'var(--shadow-soft)' }}>
          {[
            [lang === 'en' ? 'Order' : lang === 'ru' ? 'Заказ' : 'Тапсырыс', '№ ' + orderNo],
            [t.table, '№ ' + table],
            [t.items, String(count)],
          ].map(([k, v], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, padding: '6px 0', borderBottom: '1px solid var(--line-soft)' }}>
              <span style={{ color: 'var(--navy-55)' }}>{k}</span><span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
          {guests && guests.length > 0 && (
            <div style={{ padding: '8px 0 2px' }}>
              <div className="eyebrow-muted" style={{ textAlign: 'left', marginBottom: 6 }}>{t.perPerson}</div>
              {guests.map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--blue-tint)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{(g.name[0] || '?').toUpperCase()}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{g.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--navy-38)', fontWeight: 600, whiteSpace: 'nowrap' }}>· {g.count} {t.items}</span>
                  </span>
                  <span className="price" style={{ fontSize: 13 }}>{fmtPrice(g.subtotal)}</span>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 12, marginTop: 5, borderTop: '1px solid var(--line)' }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>{t.total}</span>
            <span className="serif" style={{ fontSize: 25, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{fmtPrice(total)}</span>
          </div>
        </div>

        <div className="anim-up" style={{ animationDelay: '.7s', width: '100%', maxWidth: 320, marginTop: 24 }}>
          <button className="btn btn-cta" onClick={onBack}>{t.orderMore}</button>
          <div className="eyebrow-muted" style={{ marginTop: 16, lineHeight: 1.7 }}>{t.payNote}</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Product, Cart, Success });

function WaiterSheet({ t, table, currentUser, show, onClose, onSend }) {
  const [mode, setMode] = React.useState(null);
  const [text, setText] = React.useState('');
  React.useEffect(() => { if (!show) { setMode(null); setText(''); } }, [show]);

  const quick = [
    { key: 'water', icon: 'drink', label: t.wWater },
    { key: 'cutlery', icon: 'main', label: t.wCutlery },
    { key: 'napkins', icon: 'sandwich', label: t.wNapkins },
  ];

  const sendText = () => {
    if (!text.trim()) return;
    onSend(mode === 'question' ? t.wQuestion : t.wOther, text.trim());
    setText(''); setMode(null);
  };

  return (
    <div className={'overlay' + (show ? ' show' : '')} style={{ zIndex: 360 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxHeight: '82%' }}>
        <div className="grab" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 22px 6px' }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 3 }}>{t.table} № {table}{currentUser ? ' · ' + currentUser : ''}</div>
            <div className="serif" style={{ fontSize: 26 }}>{t.waiterTitle}</div>
          </div>
          <button onClick={onClose} aria-label="close" style={{ width: 38, height: 38, borderRadius: '50%', border: '1.3px solid var(--line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--navy)' }}><Icon name="close" size={18} /></button>
        </div>
        <div style={{ padding: '0 22px 4px' }}>
          <p style={{ fontSize: 13, color: 'var(--navy-55)', fontWeight: 500 }}>{t.waiterSub}</p>
        </div>

        <div className="sb-scroll" style={{ padding: '14px 18px calc(20px + 14px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {quick.map(q => (
              <button key={q.key} onClick={() => onSend(q.label, '')}
                style={waiterRow}>
                <span style={waiterIconWrap}><Icon name={q.icon} size={19} /></span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14.5, fontWeight: 700 }}>{q.label}</span>
                <Icon name="arrow" size={17} sw={2} />
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 9 }}>
            <button onClick={() => { setMode(mode === 'question' ? null : 'question'); setText(''); }}
              style={{ ...waiterRow, ...(mode === 'question' ? waiterRowOn : {}) }}>
              <span style={waiterIconWrap}><Icon name="bell" size={19} /></span>
              <span style={{ flex: 1, textAlign: 'left' }}>
                <span style={{ display: 'block', fontSize: 14.5, fontWeight: 700 }}>{t.wQuestion}</span>
                <span style={{ display: 'block', fontSize: 11.5, color: 'var(--navy-55)', fontWeight: 500 }}>{t.wQuestionSub}</span>
              </span>
              <Icon name={mode === 'question' ? 'minus' : 'plus'} size={17} sw={2} />
            </button>
            <button onClick={() => { setMode(mode === 'other' ? null : 'other'); setText(''); }}
              style={{ ...waiterRow, ...(mode === 'other' ? waiterRowOn : {}) }}>
              <span style={waiterIconWrap}><Icon name="plus" size={19} /></span>
              <span style={{ flex: 1, textAlign: 'left', fontSize: 14.5, fontWeight: 700 }}>{t.wOther}</span>
              <Icon name={mode === 'other' ? 'minus' : 'plus'} size={17} sw={2} />
            </button>
          </div>

          {mode && (
            <div className="anim-in" style={{ marginTop: 12 }}>
              <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} rows={3}
                placeholder={mode === 'question' ? t.waiterQPh : t.waiterOtherPh}
                style={{ width: '100%', border: '1.5px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '13px 15px', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, color: 'var(--navy)', outline: 'none', resize: 'none', background: 'var(--paper)' }} />
              <button className="btn btn-cta" onClick={sendText} disabled={!text.trim()} style={{ marginTop: 10 }}>
                {t.waiterSend}<Icon name="arrow" size={18} sw={2.2} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const waiterRow = {
  display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '14px 16px',
  background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: 'var(--r-sm)',
  cursor: 'pointer', color: 'var(--navy)', transition: 'border-color .18s, background .18s',
};
const waiterRowOn = { borderColor: 'var(--blue)', background: 'var(--blue-tint)' };
const waiterIconWrap = {
  width: 38, height: 38, borderRadius: 11, background: 'var(--blue-tint)', color: 'var(--blue)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
};

Object.assign(window, { WaiterSheet });

// ─── ModifierSheet ───────────────────────────────────────────────────────────
function ModifierSheet({ t, lang, itemId, show, onClose, onConfirm }) {
  const [modSels, setModSels] = React.useState({});
  let item = null;
  if (itemId) { for (const c of MENU) { const f = c.items.find(i => i.id === itemId); if (f) { item = f; break; } } }
  const det = item && window.DETAILS && window.DETAILS[item.id];
  const modifiers = det ? (det.modifiers || []) : [];
  React.useEffect(() => {
    if (!show || !modifiers.length) return;
    const defs = {};
    modifiers.forEach(m => { if (m.options.length > 0) defs[m.id] = m.options[0].id; });
    setModSels(defs);
  }, [show, itemId]);
  if (!show || !item) return null;
  const selectedPrice = (() => {
    for (const m of modifiers) {
      const opt = m.options.find(o => o.id === modSels[m.id]);
      if (opt && opt.price) return opt.price;
    }
    return item ? item.price : 0;
  })();
  const handleConfirm = () => {
    const modText = modifiers.map(m => {
      const opt = m.options.find(o => o.id === modSels[m.id]);
      if (!opt) return null;
      return nameFor(m, lang) + ': ' + nameFor(opt, lang);
    }).filter(Boolean).join(', ');
    let priceOverride = null;
    for (const m of modifiers) {
      const opt = m.options.find(o => o.id === modSels[m.id]);
      if (opt && opt.price) { priceOverride = opt.price; break; }
    }
    onConfirm(item.id, modText || undefined, priceOverride);
  };
  return (
    <div className="overlay show" style={{ zIndex: 350 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet">
        <div className="grab" />
        <div style={{ padding: '14px 22px 6px' }}>
          <div className="eyebrow-muted" style={{ marginBottom: 6 }}>{lang === 'en' ? 'Choose option' : lang === 'ru' ? 'Выберите вариант' : 'Нұсқаны таңдаңыз'}</div>
          <div className="serif" style={{ fontSize: 24, lineHeight: 1.1 }}>{nameFor(item, lang)}</div>
        </div>
        <div style={{ padding: '16px 22px calc(24px + env(safe-area-inset-bottom, 0px))' }}>
          {modifiers.map(mod => (
            <div key={mod.id} style={{ marginBottom: 18 }}>
              <div className="eyebrow-muted" style={{ marginBottom: 10 }}>{nameFor(mod, lang)}</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {mod.options.map(opt => {
                  const on = modSels[mod.id] === opt.id;
                  return (
                    <button key={opt.id} type="button" onClick={() => setModSels(s => ({ ...s, [mod.id]: opt.id }))}
                      style={{ flex: 1, padding: '16px 10px', borderRadius: 16, cursor: 'pointer',
                        border: on ? '2px solid var(--blue)' : '1.5px solid var(--line)',
                        background: on ? 'var(--blue-tint)' : 'var(--paper)',
                        color: on ? 'var(--blue)' : 'var(--navy)',
                        fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 700,
                        transition: 'border-color .18s, background .18s, color .18s',
                        boxShadow: on ? '0 0 0 3px rgba(2,80,206,.12)' : 'none' }}>
                      {nameFor(opt, lang)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <button className="btn btn-cta" onClick={handleConfirm}
            style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span>{lang === 'en' ? 'Add to cart' : lang === 'ru' ? 'В корзину' : 'Себетке'}</span>
            <span>{typeof fmtPrice !== 'undefined' ? fmtPrice(selectedPrice) : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OrderHistorySheet ───────────────────────────────────────────────────────
function OrderHistorySheet({ show, lang, table, onClose }) {
  const history = React.useMemo(() => {
    if (!show) return [];
    try { return JSON.parse(localStorage.getItem('sb_history_t' + table) || '[]'); } catch { return []; }
  }, [show, table]);

  if (!show) return null;

  const fmtTime = (ts) => new Date(ts).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const fmtDate = (ts) => {
    const d = new Date(ts), today = new Date();
    if (d.toDateString() === today.toDateString()) return lang === 'en' ? 'Today' : lang === 'ru' ? 'Сегодня' : 'Бүгін';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="overlay show" style={{ zIndex: 350 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sheet" style={{ maxHeight: '90%' }}>
        <div className="grab" />
        <div style={{ padding: '14px 22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div className="eyebrow-muted" style={{ marginBottom: 4 }}>{lang === 'en' ? 'Table' : lang === 'ru' ? 'Стол' : 'Үстел'} {table}</div>
            <div className="serif" style={{ fontSize: 24 }}>{lang === 'en' ? 'My orders' : lang === 'ru' ? 'Мой заказ' : 'Менің тапсырысым'}</div>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: '1.3px solid var(--line)', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--navy)' }}>
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className="sb-scroll" style={{ padding: '0 22px calc(32px + env(safe-area-inset-bottom, 0px))' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--navy-38)' }}>
              <div style={{ fontSize: 42, marginBottom: 12 }}>🧾</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{lang === 'en' ? 'No orders yet' : lang === 'ru' ? 'Заказов пока нет' : 'Тапсырыс жоқ'}</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>{lang === 'en' ? 'Your orders will appear here' : lang === 'ru' ? 'Здесь появятся ваши заказы' : 'Тапсырыстарыңыз осында көрінеді'}</div>
            </div>
          ) : history.map((order, i) => (
            <div key={i} style={{ background: 'var(--paper)', borderRadius: 'var(--r)', padding: '16px', marginBottom: 12, boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>#{order.orderNo}</span>
                  <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--navy-38)', fontWeight: 600 }}>{fmtDate(order.ts)} · {fmtTime(order.ts)}</span>
                </div>
                <span className="price" style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 800 }}>{fmtPrice(order.total)}</span>
              </div>
              {order.items.map((item, j) => (
                <div key={j} style={{ fontSize: 13, fontWeight: 500, color: 'var(--navy-70)', padding: '3px 0', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <span>{nameFor(item, lang)} ×{item.qty}{item.comment ? ' · ' + item.comment : ''}</span>
                  <span style={{ fontWeight: 700, color: 'var(--navy)', whiteSpace: 'nowrap' }}>{fmtPrice(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModifierSheet, OrderHistorySheet });
