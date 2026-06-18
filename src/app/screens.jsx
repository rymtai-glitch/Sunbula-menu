// app/screens.jsx — Welcome, Menu (+ cards). Product/Cart/Success in screens2.jsx
const { useState: useS, useEffect: useE, useRef: useR } = React;

function BrandBackdrop() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(165deg, #0B47CF 0%, #0250ce 48%, #073AAE 100%)' }}>
      <div style={{ position: 'absolute', top: '-12%', left: '-18%', width: '136%', height: 320, border: '2px solid rgba(255,255,255,.10)', borderRadius: '50%', transform: 'rotate(-14deg)' }} />
      <div style={{ position: 'absolute', bottom: '6%', left: '-22%', width: '150%', height: 380, border: '2px solid rgba(255,255,255,.08)', borderRadius: '50%', transform: 'rotate(-12deg)' }} />
      <div style={{ position: 'absolute', top: '34%', right: '-30%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(47,107,255,.55) 0%, rgba(47,107,255,0) 70%)' }} />
      <div style={{ position: 'absolute', top: 90, left: 26, width: 8, height: 8, borderRadius: '50%', background: 'var(--yellow)', boxShadow: '0 0 18px rgba(255,224,0,.7)' }} />
    </div>
  );
}

function LangPicker({ lang, onSetLang }) {
  return (
    <div style={{ position: 'absolute', top: 18, right: 18, zIndex: 10, display: 'flex', gap: 6 }}>
      {['ru', 'kz', 'en'].map(l => (
        <button key={l} onClick={() => onSetLang(l)} style={{
          padding: '6px 10px', borderRadius: 20,
          background: lang === l ? 'var(--yellow)' : 'rgba(255,255,255,.15)',
          border: '1px solid ' + (lang === l ? 'var(--yellow)' : 'rgba(255,255,255,.3)'),
          color: lang === l ? '#0B1020' : 'rgba(255,255,255,.9)',
          fontFamily: 'var(--sans)', fontWeight: 700, fontSize: 11, letterSpacing: .8,
          cursor: 'pointer', textTransform: 'uppercase',
        }}>
          {l === 'ru' ? 'РУС' : l === 'kz' ? 'ҚАЗ' : 'ENG'}
        </button>
      ))}
    </div>
  );
}

function Welcome({ t, lang, table, onOpen, onSetLang }) {
  const tagline = lang === 'en' ? <>A morning worth<br />savoring</> : lang === 'kz' ? <>Созғыңыз келетін<br />таң</> : <>Утро, которое<br />хочется продлить</>;
  return (
    <div className="sb-app" style={{ background: 'var(--blue)' }}>
      <BrandBackdrop />
      <LangPicker lang={lang} onSetLang={onSetLang} />
      <div className="anim-up" style={{ position: 'relative', zIndex: 2, textAlign: 'center', paddingTop: 96 }}>
        <img src={LOGO_WHITE} alt="Sunbula" style={{ width: 210, height: 'auto', display: 'inline-block' }} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 2, padding: '0 30px 48px' }}>
        <div className="anim-up" style={{ animationDelay: '.12s' }}>
          <div className="eyebrow" style={{ color: 'var(--yellow)', marginBottom: 14 }}>{t.greet}</div>
          <div className="serif" style={{ fontSize: 38, color: '#fff', lineHeight: 1.0 }}>
            {tagline}
          </div>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,.82)', fontWeight: 500, maxWidth: 320 }}>
            {t.welcomeSub}
          </p>
        </div>
        <div className="anim-up" style={{ animationDelay: '.26s', marginTop: 26 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 15px',
              borderRadius: 30, border: '1px solid rgba(255,255,255,.28)', background: 'rgba(255,255,255,.1)',
              backdropFilter: 'blur(8px)', color: '#fff', fontSize: 12.5, fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--yellow)' }} />
              {t.table} № {table}
            </span>
          </div>
          <button className="btn btn-cta" style={{ background: 'var(--yellow)', color: '#0B1020', boxShadow: '0 14px 40px rgba(0,0,0,.32)' }} onClick={onOpen}>
            {t.open}<Icon name="arrow" size={18} sw={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function NameScreen({ t, lang, table, onConfirm, onSetLang }) {
  const [name, setName] = useS('');
  const [err, setErr] = useS(false);
  const submit = () => {
    if (!name.trim()) { setErr(true); return; }
    onConfirm(name.trim());
  };
  return (
    <div className="sb-app" style={{ background: 'var(--blue)', zIndex: 120 }}>
      <BrandBackdrop />
      <LangPicker lang={lang} onSetLang={onSetLang} />
      <div className="sb-scroll" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 30px', flex: 1 }}>
        <div className="anim-up" style={{ textAlign: 'center', marginBottom: 30 }}>
          <img src={LOGO_WHITE} alt="Sunbula" style={{ width: 132, height: 'auto' }} />
        </div>
        <div className="anim-up" style={{ animationDelay: '.08s' }}>
          <div className="eyebrow" style={{ color: 'var(--yellow)', marginBottom: 12, textAlign: 'center' }}>{t.table} № {table}</div>
          <div className="serif" style={{ fontSize: 34, color: '#fff', textAlign: 'center', lineHeight: 1 }}>{t.nameTitle}</div>
          <p style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.6, color: 'rgba(255,255,255,.78)', textAlign: 'center', fontWeight: 500, maxWidth: 300, margin: '14px auto 0' }}>
            {t.nameSub}
          </p>
        </div>
        <div className="anim-up" style={{ animationDelay: '.18s', marginTop: 28 }}>
          <input autoFocus value={name} maxLength={24}
            onChange={(e) => { setName(e.target.value); setErr(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            placeholder={t.namePh}
            style={{
              width: '100%', textAlign: 'center', borderRadius: 16, padding: '17px 18px',
              background: 'rgba(255,255,255,.14)', border: '1.6px solid ' + (err ? '#FFE000' : 'rgba(255,255,255,.34)'),
              color: '#fff', fontFamily: 'var(--sans)', fontSize: 18, fontWeight: 700, outline: 'none',
            }} />
          <div style={{ height: 20, marginTop: 8, textAlign: 'center', color: 'var(--yellow)', fontSize: 12.5, fontWeight: 600, opacity: err ? 1 : 0, transition: 'opacity .2s' }}>{t.nameErr}</div>
          <button className="btn btn-cta" onClick={submit}
            style={{ marginTop: 6, background: 'var(--yellow)', color: '#0B1020', boxShadow: '0 14px 40px rgba(0,0,0,.32)' }}>
            {t.nameBtn}<Icon name="arrow" size={18} sw={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuCard({ cat, item, lang, qty, stopList, onOpen, onAdd, onInc, onDec }) {
  const name = nameFor(item, lang);
  const desc = descFor(item, lang);
  const unavailable = stopList ? stopList.has(item.id) : false;
  const soldOut = lang === 'en' ? 'Sold out' : lang === 'kz' ? 'Таусылды' : 'Нет в наличии';
  return (
    <div className="card anim-in" onClick={!unavailable ? onOpen : undefined}
      style={{ cursor: unavailable ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', opacity: unavailable ? 0.45 : 1 }}>
      {item.isNew && !unavailable && <span className="tag-new">New</span>}
      <Photo tone={cat.tone} icon={catIconName[cat.id]} src={photoFor(item.id)} tag={nameFor(cat, lang)}
        style={{ height: 134 }} radius="0" />
      <div style={{ padding: '12px 13px 13px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.28, letterSpacing: '.1px' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: unavailable ? 'var(--navy-38)' : 'var(--navy-55)', lineHeight: 1.4, marginTop: 4, minHeight: 32,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {unavailable ? soldOut : desc}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 11 }}
          onClick={(e) => e.stopPropagation()}>
          <span className="price" style={{ fontSize: 14.5 }}>{fmtPrice(item.price)}</span>
          {!unavailable && <AddControl qty={qty} onAdd={onAdd} onInc={onInc} onDec={onDec} />}
        </div>
      </div>
    </div>
  );
}

function WideRow({ cat, item, lang, qty, stopList, onOpen, onAdd, onInc, onDec }) {
  const name = nameFor(item, lang);
  const desc = descFor(item, lang);
  const unavailable = stopList ? stopList.has(item.id) : false;
  const soldOut = lang === 'en' ? 'Sold out' : lang === 'kz' ? 'Таусылды' : 'Нет в наличии';
  return (
    <div className="card anim-in" onClick={!unavailable ? onOpen : undefined}
      style={{ cursor: unavailable ? 'default' : 'pointer', display: 'flex', alignItems: 'center', borderRadius: 'var(--r-sm)', opacity: unavailable ? 0.45 : 1 }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {item.isNew && !unavailable && <span className="tag-new" style={{ top: 7, left: 7, fontSize: 8, padding: '3px 7px' }}>New</span>}
        <Photo tone={cat.tone} icon={catIconName[cat.id]} src={photoFor(item.id)} style={{ width: 92, height: 92 }} radius="0" />
      </div>
      <div style={{ flex: 1, minWidth: 0, padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{name}</div>
        <div style={{ fontSize: 11.5, color: unavailable ? 'var(--navy-38)' : 'var(--navy-55)', lineHeight: 1.4, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {unavailable ? soldOut : desc}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}
          onClick={(e) => e.stopPropagation()}>
          <span className="price" style={{ fontSize: 14.5 }}>{fmtPrice(item.price)}</span>
          {!unavailable && <AddControl qty={qty} onAdd={onAdd} onInc={onInc} onDec={onDec} />}
        </div>
      </div>
    </div>
  );
}

function Menu({ t, lang, table, currentUser, cart, cartCount, cartTotal, loading, hidden,
  stopList, onToggleLang, onWaiter, onOpenItem, onAdd, onInc, onDec, onOpenCart, onOpenHistory }) {
  const [active, setActive] = useS('all');
  const [query, setQuery] = useS('');
  const scrollRef = useR(null);
  const railRef = useR(null);

  const q = query.trim().toLowerCase();
  const filtered = MENU.map(cat => ({
    ...cat,
    items: cat.items.filter(i => {
      if (!q) return true;
      return (i.nameRu + ' ' + i.nameKz + ' ' + i.descRu).toLowerCase().includes(q);
    })
  })).filter(cat => cat.items.length > 0);

  const visible = q ? filtered : (active === 'all' ? MENU : MENU.filter(c => c.id === active));
  const noResults = q && filtered.length === 0;

  const goCat = (id) => {
    setActive(id);
    setQuery('');
    if (id === 'all') { scrollRef.current && scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    setTimeout(() => {
      const el = document.getElementById('sec-' + id);
      if (el && scrollRef.current) {
        scrollRef.current.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
      }
    }, 30);
  };

  return (
    <div className="sb-app" style={hidden ? { display: 'none' } : null}>
      <div style={{ background: 'var(--ivory)', position: 'relative', zIndex: 10, paddingTop: 56, boxShadow: '0 1px 0 var(--line-soft)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={LOGO_BLUE} alt="Sunbula" style={{ height: 34, width: 'auto' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onOpenHistory} aria-label="history" style={{
              height: 38, padding: '0 14px', borderRadius: 30, border: '1.3px solid var(--line)', background: 'var(--paper)',
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 800, letterSpacing: '.3px', cursor: 'pointer', color: 'var(--navy)',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
              </svg>
              {lang === 'en' ? 'Orders' : lang === 'ru' ? 'Заказы' : 'Тапсырыстар'}
            </button>
            <button onClick={onWaiter} aria-label="waiter" style={{
              width: 38, height: 38, borderRadius: '50%', border: '1.3px solid var(--line)', background: 'var(--paper)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--blue)',
            }}><Icon name="bell" size={18} /></button>
            <button onClick={onToggleLang} style={{
              height: 38, padding: '0 14px', borderRadius: 30, border: '1.3px solid var(--line)', background: 'var(--paper)',
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 800, letterSpacing: '1px', cursor: 'pointer', color: 'var(--navy)',
            }}>{lang === 'ru' ? 'ҚАЗ' : lang === 'kz' ? 'ENG' : 'РУС'}</button>
          </div>
        </div>
        {currentUser && (
          <div style={{ padding: '0 20px 10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--blue-tint)', borderRadius: 30, padding: '5px 12px 5px 5px' }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{(currentUser[0] || '?').toUpperCase()}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>{t.orderby} · {currentUser}</span>
            </span>
          </div>
        )}
        <div style={{ padding: '0 20px 12px' }}>
          <div className="search">
            <Icon name="search" size={17} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.search} />
          </div>
        </div>
        {!q && (
          <div className="rail" ref={railRef}>
            <button className={'chip' + (active === 'all' ? ' on' : '')} onClick={() => goCat('all')}>{t.all}</button>
            {MENU.map(c => (
              <button key={c.id} className={'chip' + (active === c.id ? ' on' : '')} onClick={() => goCat(c.id)}>
                {nameFor(c, lang)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sb-scroll" ref={scrollRef} style={{ paddingTop: 18, paddingBottom: cartCount ? 110 : 40 }}>
        {loading ? <MenuSkeleton /> : noResults ? (
          <EmptyState icon="search" title={t.emptySearch} sub={t.emptySearchSub} />
        ) : visible.map(cat => (
          <section key={cat.id} id={'sec-' + cat.id} style={{ marginBottom: 30, scrollMarginTop: 8 }}>
            <div style={{ padding: '0 20px', marginBottom: 14, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div className="eyebrow" style={{ marginBottom: 5 }}>{lang === 'kz' ? (cat.nameEn || cat.nameRu) : cat.nameKz}</div>
                <div className="serif" style={{ fontSize: 27 }}>{nameFor(cat, lang)}</div>
              </div>
              <span className="eyebrow-muted" style={{ paddingBottom: 4 }}>{cat.items.length}</span>
            </div>
            {cat.wide ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 20px' }}>
                {cat.items.map(item => (
                  <WideRow key={item.id} cat={cat} item={item} lang={lang} qty={cart[item.id]} stopList={stopList}
                    onOpen={() => onOpenItem(item.id)} onAdd={() => onAdd(item.id)} onInc={() => onInc(item.id)} onDec={() => onDec(item.id)} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 13, padding: '0 20px' }}>
                {cat.items.map(item => (
                  <MenuCard key={item.id} cat={cat} item={item} lang={lang} qty={cart[item.id]} stopList={stopList}
                    onOpen={() => onOpenItem(item.id)} onAdd={() => onAdd(item.id)} onInc={() => onInc(item.id)} onDec={() => onDec(item.id)} />
                ))}
              </div>
            )}
          </section>
        ))}
        {!loading && !noResults && (
          <div style={{ textAlign: 'center', padding: '8px 30px 20px' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--gold)', margin: '0 auto 12px' }} />
            <div className="eyebrow-muted" style={{ lineHeight: 1.7 }}>{t.payNote}</div>
          </div>
        )}
      </div>

      {cartCount > 0 && (
        <div className="floatbar">
          <button className="btn btn-cta" onClick={onOpenCart}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Icon name="bag" size={18} />
              {t.cart} · {cartCount}
            </span>
            <span style={{ fontWeight: 700 }}>{fmtPrice(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="anim-in" style={{ textAlign: 'center', padding: '70px 40px' }}>
      <div style={{ width: 76, height: 76, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--paper)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', color: 'var(--navy-38)' }}>
        <Icon name={icon} size={30} sw={1.4} />
      </div>
      <div className="serif" style={{ fontSize: 24, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: 'var(--navy-55)', lineHeight: 1.6, maxWidth: 240, margin: '0 auto' }}>{sub}</div>
      {action}
    </div>
  );
}

Object.assign(window, { Welcome, NameScreen, BrandBackdrop, Menu, MenuCard, WideRow, EmptyState });
