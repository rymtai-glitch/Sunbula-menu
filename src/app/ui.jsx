// app/ui.jsx — Sunbula primitives: icons, photo placeholders, controls, skeletons, toast
const { useState, useEffect, useRef } = React;

// ---------- language helpers ----------
window.nameFor = (o, lang) => lang === 'en' ? (o.nameEn || o.nameRu) : lang === 'kz' ? o.nameKz : o.nameRu;
window.descFor = (o, lang) => lang === 'en' ? (o.descEn || o.descRu) : lang === 'kz' ? o.descKz : o.descRu;

// ---------- formatting ----------
const fmtPrice = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';

// ---------- icon set (thin line, editorial) ----------
const S = (p) => ({ fill: 'none', stroke: 'currentColor', strokeWidth: p || 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' });
const Icon = ({ name, size = 22, sw }) => {
  const c = { width: size, height: size, viewBox: '0 0 24 24', ...S(sw) };
  const paths = {
    search: <g><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></g>,
    back: <path d="M15 5l-7 7 7 7" />,
    plus: <g><path d="M12 6v12" /><path d="M6 12h12" /></g>,
    minus: <path d="M6 12h12" />,
    close: <g><path d="M6 6l12 12" /><path d="M18 6L6 18" /></g>,
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    bag: <g><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></g>,
    bell: <g><path d="M18 9a6 6 0 0 0-12 0c0 7-2 8-2 8h16s-2-1-2-8" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></g>,
    check: <path d="M5 13l4 4 10-10" />,
    leaf: <g><path d="M11 21C5 19 4 9 12 4c0 0 8 6 0 14" /><path d="M12 18c-1-4 1-7 4-9" /></g>,
    breakfast: <g><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.1" fill="currentColor" stroke="none" /></g>,
    oat: <g><path d="M5 11h14" /><path d="M6 11c0 5 2.5 8 6 8s6-3 6-8" /><path d="M9 7c0-1.4 1.3-2 1.3-2M12 7c0-1.4 1.3-2 1.3-2" /></g>,
    sweet: <g><path d="M12 4c-2.5 0-4 1.6-4 4h8c0-2.4-1.5-4-4-4z" /><path d="M7 8v2a5 5 0 0 0 10 0V8" /><path d="M8 18h8" /></g>,
    salad: <g><path d="M4 12a8 8 0 0 0 16 0H4z" /><path d="M12 5v7M8 7l4 5M16 7l-4 5" /></g>,
    bowl: <g><path d="M4 11h16" /><path d="M5 11c0 4 3 7 7 7s7-3 7-7" /><path d="M9 6c1-1 2-1 3 0" /></g>,
    sandwich: <g><rect x="3" y="5" width="18" height="3" rx="1.5" /><rect x="3" y="16" width="18" height="3" rx="1.5" /><path d="M6 8h12c0 2.6-2 4.5-6 4.5S6 10.6 6 8z" /></g>,
    main: <g><path d="M4 19h16" /><path d="M6 19V11a6 6 0 0 1 12 0v8" /><path d="M12 5V3" /></g>,
    pasta: <g><ellipse cx="12" cy="13" rx="8" ry="4.5" /><path d="M4 13c0 3 3.6 5.5 8 5.5s8-2.5 8-5.5" /><path d="M8 8v2M12 7v3M16 8v2" /></g>,
    pizza: <g><path d="M12 3L3 20h18L12 3z" /><circle cx="12" cy="11" r="1" /><circle cx="10" cy="16" r="1" /><circle cx="14" cy="16" r="1" /></g>,
    soup: <g><path d="M4 11h16" /><path d="M5 11c0 4 3 7 7 7s7-3 7-7" /><path d="M12 4v3" /></g>,
    coffee: <g><path d="M17 9h1.5a3 3 0 0 1 0 6H17" /><path d="M4 9h13v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" /><path d="M7 3v2M11 3v2" /></g>,
    drink: <g><path d="M7 4h10l-1.4 14.5a1.5 1.5 0 0 1-1.5 1.5H9.9a1.5 1.5 0 0 1-1.5-1.5L7 4z" /><path d="M7.5 9h9" /></g>,
    tea: <g><path d="M16 9h1.5a2.5 2.5 0 0 1 0 5H16" /><path d="M4 9h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V9z" /><path d="M8 3c-.6 1 .6 1.6 0 3M11 3c-.6 1 .6 1.6 0 3" /></g>,
    lemon: <g><circle cx="12" cy="12" r="8" /><path d="M12 4c0 0 3 3 3 8s-3 8-3 8" /><path d="M4 12h16" /></g>,
  };
  return <svg {...c}>{paths[name] || paths.main}</svg>;
};

const catIconName = {
  breakfast:'breakfast', porridge:'oat', sweet:'sweet', salads:'salad', bowls:'bowl',
  snacks:'sandwich', main:'main', kurinye:'main', pasta:'pasta', pizza:'pizza', soups:'soup',
  coffee:'coffee', filter:'coffee', signature:'drink', tea:'tea', lemonade:'lemon',
};

// ---------- photo placeholder ----------
const TONES = {
  sunrise:['#E6EEFF','#CFE0FC'], oat:['#ECF1FB','#D8E4F7'], berry:['#EFE9F8','#DDD2F1'],
  green:['#E6F1F1','#CFE6E4'], toast:['#EDEFFA','#D6DEF4'], roast:['#E7EBF7','#CFD8EE'],
  cream:['#EEF2FC','#DCE6F8'], broth:['#EAEFF8','#D6E0F1'], espresso:['#E4E9F6','#CCD6EC'],
  matcha:['#E7F0EC','#D2E6DA'], tea:['#EFEDF8','#DEDAF0'], citrus:['#EEF1FA','#DEE3F2'],
};
function Photo({ tone = 'oat', icon = 'main', tag, radius, style, big = false, noIcon = false, src = null, fit = 'cover' }) {
  const [a, b] = TONES[tone] || TONES.oat;
  const [err, setErr] = useState(false);
  if (src && !err) {
    return (
      <div className="ph" style={{ borderRadius: radius, ...style }}>
        <img src={src} alt="" loading="lazy" onError={() => setErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit, display: 'block' }} />
        {tag && <span className="ph-tag" style={{ color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,.5)' }}>{tag}</span>}
      </div>
    );
  }
  return (
    <div className="ph" style={{
      background: `linear-gradient(145deg, ${a} 0%, ${b} 100%)`,
      borderRadius: radius, ...style,
    }}>
      <div className="ph-grain" />
      {!noIcon && (
        <div className="ph-icon" style={{ opacity: .26 }}>
          <Icon name={icon} size={big ? 58 : 38} sw={1.2} />
        </div>
      )}
      {tag && <span className="ph-tag">{tag}</span>}
    </div>
  );
}

// ---------- qty / add control ----------
function AddControl({ qty, onAdd, onInc, onDec, size = 'sm' }) {
  if (!qty) {
    return (
      <button className="add-round" onClick={onAdd} aria-label="add"
        style={size === 'lg' ? { width: 44, height: 44 } : {}}>
        <Icon name="plus" size={size === 'lg' ? 20 : 17} sw={2} />
      </button>
    );
  }
  return (
    <div className="qty">
      <button onClick={onDec} aria-label="minus"><Icon name="minus" size={14} sw={2} /></button>
      <span className="n">{qty}</span>
      <button onClick={onInc} aria-label="plus"><Icon name="plus" size={14} sw={2} /></button>
    </div>
  );
}

// ---------- skeleton ----------
function Skeleton({ w = '100%', h = 14, r = 8, style }) {
  return <div className="sk" style={{ width: w, height: h, borderRadius: r, ...style }} />;
}
function MenuSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, padding: '0 20px' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card" style={{ boxShadow: 'none', background: 'transparent' }}>
          <Skeleton h={132} r={20} />
          <div style={{ padding: '12px 4px 0' }}>
            <Skeleton w="80%" h={13} />
            <Skeleton w="55%" h={11} style={{ marginTop: 9 }} />
            <Skeleton w="40%" h={14} style={{ marginTop: 14 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- toast ----------
function Toast({ msg, show }) {
  return (
    <div className={'toast' + (show ? ' show' : '')}>
      <span className="dot" />{msg}
    </div>
  );
}

Object.assign(window, { fmtPrice, Icon, catIconName, Photo, AddControl, Skeleton, MenuSkeleton, Toast });
