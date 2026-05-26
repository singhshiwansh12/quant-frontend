import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { useState, useEffect, useRef, useCallback } from "react";

function App() {
  const [count, setCount] = useState(0)
const isLocal = window.location.hostname === "localhost";

// Tumhara live backend URL
const API = isLocal 
  ? "http://localhost:8000" 
  : "https://quant-backend-935k.onrender.com";

// WebSocket – live ke liye wss://
const WS  = isLocal 
  ? "ws://localhost:8000/ws" 
  : "wss://quant-backend-935k.onrender.com/ws";

// ── GLOBAL STYLES ─────────────────────────────────────────────────────────────
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Exo+2:wght@300;400;500;600;700;800;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg:       #06090f;
      --bg2:      #0b1120;
      --bg3:      #101828;
      --bg4:      #162035;
      --border:   #1a2d45;
      --border2:  #243d5c;
      --text:     #cddae8;
      --text2:    #7a99b8;
      --text3:    #3f5a75;
      --buy:      #00e676;
      --buy2:     #00c853;
      --buy-bg:   rgba(0,230,118,0.07);
      --sell:     #ff4d6d;
      --sell2:    #d32048;
      --sell-bg:  rgba(255,77,109,0.07);
      --accent:   #00b4d8;
      --accent2:  #007fa8;
      --gold:     #ffd600;
      --card:     #0b1120;
      --mono:     'JetBrains Mono', monospace;
      --ui:       'Exo 2', sans-serif;
    }
    html, body, #root { width:100%; height:100%; overflow:hidden; background:var(--bg); color:var(--text); font-family:var(--mono); }
    ::-webkit-scrollbar { width:4px; height:4px; }
    ::-webkit-scrollbar-track { background:var(--bg); }
    ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:2px; }
    input, button, select { font-family:inherit; outline:none; border:none; background:none; }
    @keyframes fadeIn   { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
    @keyframes pulse    { 0%,100%{opacity:1;} 50%{opacity:0.35;} }
    @keyframes slideIn  { from { opacity:0; transform:translateX(8px); } to { opacity:1; transform:none; } }
    @keyframes flashUp  { 0%{background:rgba(0,230,118,0.18);} 100%{background:transparent;} }
    @keyframes flashDn  { 0%{background:rgba(255,77,109,0.18);} 100%{background:transparent;} }
  `}</style>
);

// ── UTILS ─────────────────────────────────────────────────────────────────────
const fmt   = (n, d=2) => (+n||0).toLocaleString('en-IN', { minimumFractionDigits:d, maximumFractionDigits:d });
const fmtPct = n => `${n>=0?'+':''}${fmt(n)}%`;
const clr   = v => v > 0 ? 'var(--buy)' : v < 0 ? 'var(--sell)' : 'var(--text3)';

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]     = useState("login");
  const [name, setName]     = useState("");
  const [pass, setPass]     = useState("");
  const [err,  setErr]      = useState("");
  const [busy, setBusy]     = useState(false);

  const submit = async () => {
    if (!name.trim() || !pass.trim()) return setErr("Fill all fields");
    setBusy(true); setErr("");
    try {
      if (mode === "signup") {
        const r = await fetch(`${API}/signup`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name, password: pass })
        });
        if (!r.ok) throw new Error((await r.json()).detail);
      }
      const fd = new FormData();
      fd.append("username", name); fd.append("password", pass);
      const r2 = await fetch(`${API}/login`, { method:"POST", body:fd });
      if (!r2.ok) throw new Error((await r2.json()).detail);
      const { access_token } = await r2.json();
      onAuth(access_token, name);
    } catch(e) { setErr(e.message); }
    setBusy(false);
  };

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      width:'100vw', height:'100vh',
      background:'radial-gradient(ellipse at 25% 15%, #0a1f3a 0%, var(--bg) 65%)'
    }}>
      {/* Grid BG */}
      <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="55" height="55" patternUnits="userSpaceOnUse">
            <path d="M55 0L0 0 0 55" fill="none" stroke="#142238" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.6"/>
      </svg>

      <div style={{
        width:390, padding:'40px 36px 32px', position:'relative', zIndex:1,
        background:'var(--bg2)', border:'1px solid var(--border)',
        borderRadius:8, boxShadow:'0 0 80px rgba(0,180,216,0.07), 0 0 0 1px rgba(0,180,216,0.04)',
        animation:'fadeIn 0.45s ease'
      }}>
        {/* Logo */}
        <div style={{textAlign:'center', marginBottom:32}}>
          <div style={{
            fontFamily:'var(--ui)', fontWeight:900, fontSize:26, letterSpacing:3,
            background:'linear-gradient(130deg, #00b4d8 0%, #00e676 100%)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
          }}>⬡ QUANT TERMINAL</div>
          <div style={{color:'var(--text3)', fontSize:10, letterSpacing:4, marginTop:4, fontFamily:'var(--ui)'}}>v11 PRO · LIVE MARKET ENGINE</div>
        </div>

        {/* Mode tabs */}
        <div style={{display:'flex', borderBottom:'1px solid var(--border)', marginBottom:26}}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setErr(""); }} style={{
              flex:1, paddingBottom:10, border:'none', background:'none', cursor:'pointer',
              borderBottom: mode===m ? '2px solid var(--accent)' : '2px solid transparent',
              color: mode===m ? 'var(--accent)' : 'var(--text3)',
              fontFamily:'var(--ui)', fontWeight:700, fontSize:11, letterSpacing:2,
              textTransform:'uppercase', transition:'all 0.2s', marginBottom:-1
            }}>{m}</button>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {[["USERNAME", name, setName, "text"], ["PASSWORD", pass, setPass, "password"]].map(([label, val, set, type]) => (
            <div key={label}>
              <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2.5, marginBottom:6, fontFamily:'var(--ui)', fontWeight:700}}>{label}</div>
              <input value={val} onChange={e => set(e.target.value)} type={type}
                onKeyDown={e => e.key==='Enter' && submit()}
                style={{
                  width:'100%', padding:'10px 12px', borderRadius:4, fontSize:13,
                  background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)',
                  transition:'border-color 0.2s', fontFamily:'var(--mono)'
                }}
                onFocus={e=>e.target.style.borderColor='var(--accent)'}
                onBlur={e=>e.target.style.borderColor='var(--border)'}
              />
            </div>
          ))}

          {err && (
            <div style={{padding:'8px 12px', background:'var(--sell-bg)', border:'1px solid rgba(255,77,109,0.3)', borderRadius:4, color:'var(--sell)', fontSize:12}}>
              ⚠ {err}
            </div>
          )}

          <button onClick={submit} disabled={busy} style={{
            marginTop:4, padding:'13px', width:'100%', borderRadius:4, cursor:'pointer',
            background:'linear-gradient(135deg, var(--accent2), #005070)',
            color:'#fff', fontFamily:'var(--ui)', fontWeight:700, fontSize:13, letterSpacing:1.5,
            border:'1px solid rgba(0,180,216,0.3)', transition:'all 0.2s',
            opacity: busy ? 0.7 : 1
          }}>
            {busy ? '◌ CONNECTING...' : mode==='login' ? '→ ENTER MARKET' : '→ CREATE ACCOUNT'}
          </button>

          <div style={{textAlign:'center', color:'var(--text3)', fontSize:11, marginTop:4}}>
            <span style={{fontFamily:'var(--ui)'}}>Demo: </span>
            <span style={{color:'var(--accent)'}}>admin / admin123</span>
            <span style={{color:'var(--text3)'}}> · </span>
            <span style={{color:'var(--accent)'}}>trader1 / trade123</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PRICE CHART ───────────────────────────────────────────────────────────────
function PriceChart({ history }) {
  const wrapRef = useRef(null);
  const [dim, setDim] = useState({ w:600, h:220 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      setDim({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  const data = history.slice(-80);
  const { w, h } = dim;
  const PAD = { top:18, right:62, bottom:36, left:6 };
  const VOL_H = 28;
  const chartW = w - PAD.left - PAD.right;
  const chartH = h - PAD.top - PAD.bottom - VOL_H - 4;

  if (data.length < 2) return (
    <div ref={wrapRef} style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:11}}>
      Awaiting market data...
    </div>
  );

  const prices = data.map(d => d.price);
  const minP = Math.min(...prices) * 0.9985;
  const maxP = Math.max(...prices) * 1.0015;
  const rng  = maxP - minP || 1;
  const px   = i => PAD.left + (i / (data.length - 1)) * chartW;
  const py   = p => PAD.top + chartH - ((p - minP) / rng) * chartH;

  const linePts  = data.map((d, i) => `${px(i)},${py(d.price)}`).join(' ');
  const areaPts  = `${px(0)},${PAD.top+chartH} ${linePts} ${px(data.length-1)},${PAD.top+chartH}`;
  const last     = prices[prices.length - 1];
  const first    = prices[0];
  const isUp     = last >= first;
  const mainClr  = isUp ? 'var(--buy)' : 'var(--sell)';
  const yTicks   = 5;

  return (
    <div ref={wrapRef} style={{width:'100%', height:'100%'}}>
      <svg width={w} height={h} style={{overflow:'visible'}}>
        <defs>
          <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isUp?'#00e676':'#ff4d6d'} stopOpacity="0.22"/>
            <stop offset="100%" stopColor={isUp?'#00e676':'#ff4d6d'} stopOpacity="0.01"/>
          </linearGradient>
          <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor={isUp?'#00e676':'#ff4d6d'} stopOpacity="0.4"/>
            <stop offset="100%" stopColor={isUp?'#00e676':'#ff4d6d'} stopOpacity="1"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Y-axis grid */}
        {Array.from({length:yTicks}, (_, i) => minP + rng * i / (yTicks-1)).map((v, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={py(v)} x2={PAD.left+chartW} y2={py(v)}
              stroke="#142030" strokeWidth="1" strokeDasharray="3,8"/>
            <text x={PAD.left+chartW+6} y={py(v)+4}
              fill="#3a5570" fontSize="10" fontFamily="'JetBrains Mono',monospace">{fmt(v,0)}</text>
          </g>
        ))}

        {/* Area + Line */}
        <polygon points={areaPts} fill="url(#areaG)"/>
        <polyline points={linePts} fill="none" stroke="url(#lineG)" strokeWidth="2.2"/>

        {/* Current price guideline */}
        <line x1={PAD.left} y1={py(last)} x2={PAD.left+chartW} y2={py(last)}
          stroke={mainClr} strokeWidth="1" strokeDasharray="4,5" strokeOpacity="0.5"/>

        {/* Last price dot */}
        <circle cx={px(data.length-1)} cy={py(last)} r="5"
          fill={mainClr} stroke="var(--bg)" strokeWidth="2.5" filter="url(#glow)"/>

        {/* Price badge */}
        <rect x={PAD.left+chartW+2} y={py(last)-11} width={58} height={20}
          fill={isUp?'#00a843':'#b51b3c'} rx="3"/>
        <text x={PAD.left+chartW+31} y={py(last)+4}
          fill="#fff" fontSize="10" fontFamily="'JetBrains Mono',monospace"
          textAnchor="middle" fontWeight="700">{fmt(last,2)}</text>

        {/* Volume bars */}
        {data.map((d, i) => {
          if (!i) return null;
          const chg = Math.abs(d.price - data[i-1].price);
          const ratio = Math.min(chg / (rng * 0.08 + 0.0001), 1);
          const bh = Math.max(2, ratio * VOL_H);
          const bw = Math.max(1.5, chartW / data.length - 0.8);
          const vy = PAD.top + chartH + 4 + VOL_H - bh;
          return (
            <rect key={i} x={px(i)-bw/2} y={vy} width={bw} height={bh}
              fill={d.price >= data[i-1].price ? '#00e676' : '#ff4d6d'} opacity="0.38"/>
          );
        })}

        {/* X-axis time labels */}
        {[0, Math.floor(data.length*0.25), Math.floor(data.length*0.5), Math.floor(data.length*0.75), data.length-1].map(i => {
          const d = data[i]; if (!d?.ts) return null;
          return (
            <text key={i} x={px(i)} y={h-2} fill="#3a5570" fontSize="9"
              fontFamily="'JetBrains Mono',monospace" textAnchor="middle">
              {new Date(d.ts).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

// ── ORDER BOOK ────────────────────────────────────────────────────────────────
function OrderBook({ orderBook, lastPrice }) {
  const { bids=[], asks=[] } = orderBook;
  const maxQty = Math.max(...[...bids,...asks].map(o=>o.qty), 1);
  const spread = (asks[0]?.price && bids[0]?.price) ? asks[0].price - bids[0].price : 0;

  const Row = ({ side, price, qty }) => {
    const isBuy = side==='bid';
    const pct = (qty/maxQty)*100;
    return (
      <div style={{
        display:'flex', position:'relative', height:21, alignItems:'center',
        padding:'0 10px', fontSize:11, cursor:'default',
        transition:'background 0.2s'
      }}>
        <div style={{
          position:'absolute', [isBuy?'left':'right']:0, top:0, bottom:0,
          width:`${pct}%`,
          background: isBuy ? 'rgba(0,230,118,0.065)' : 'rgba(255,77,109,0.065)',
          transition:'width 0.4s ease'
        }}/>
        <span style={{flex:1, color:isBuy?'var(--buy)':'var(--sell)', fontWeight:600, position:'relative', letterSpacing:0.3}}>
          {fmt(price,2)}
        </span>
        <span style={{color:'var(--text2)', position:'relative', fontSize:10.5}}>{qty}</span>
      </div>
    );
  };

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', fontSize:10}}>
      <div style={{display:'flex', justifyContent:'space-between', padding:'4px 10px', color:'var(--text3)', letterSpacing:2, fontFamily:'var(--ui)', borderBottom:'1px solid var(--border)'}}>
        <span>PRICE</span><span>QTY</span>
      </div>
      <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column'}}>
        {/* Asks (reversed so best ask is near spread) */}
        <div style={{flex:1, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'flex-end'}}>
          {asks.slice(0,9).reverse().map((a,i) => <Row key={i} side="ask" price={a.price} qty={a.qty}/>)}
        </div>
        {/* Spread */}
        <div style={{padding:'4px 10px', background:'var(--bg4)', display:'flex', justifyContent:'space-between', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)'}}>
          <span style={{color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)'}}>SPREAD</span>
          <span style={{color:'var(--accent)', fontWeight:600}}>{fmt(spread,2)}</span>
          <span style={{color:'var(--text2)', fontWeight:700}}>{lastPrice ? fmt(lastPrice,2) : '--'}</span>
        </div>
        {/* Bids */}
        <div style={{flex:1, overflow:'hidden'}}>
          {bids.slice(0,9).map((b,i) => <Row key={i} side="bid" price={b.price} qty={b.qty}/>)}
        </div>
      </div>
    </div>
  );
}

// ── TRADE PANEL ───────────────────────────────────────────────────────────────
function TradePanel({ product, token, lastPrice, onDone }) {
  const [side, setSide]   = useState("BUY");
  const [mode, setMode]   = useState("market");
  const [price, setPrice] = useState("");
  const [qty,   setQty]   = useState("1");
  const [msg,   setMsg]   = useState(null);
  const [busy,  setBusy]  = useState(false);

  // Sync market price into price field when in market mode
  useEffect(() => {
    if (mode === 'market' && lastPrice) setPrice(lastPrice.toFixed(2));
  }, [lastPrice, mode]);

  const total = (parseFloat(price)||0) * (parseInt(qty)||0);

  const placeOrder = async () => {
    if (!product) return;
    setBusy(true); setMsg(null);
    try {
      const body = {
        product_id: product.pid,
        price: parseFloat(price) || lastPrice || 0,
        quantity: Math.max(1, parseInt(qty) || 1),
        type: side,
        market: mode === 'market'
      };
      const r = await fetch(`${API}/place-order`, {
        method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${token}` },
        body: JSON.stringify(body)
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.detail);
      setMsg({ ok:true, text: `✓ ${d.message}` });
      onDone();
      setTimeout(() => setMsg(null), 4000);
    } catch(e) { setMsg({ ok:false, text:`✗ ${e.message}` }); }
    setBusy(false);
  };

  const triggerBots = async () => {
    if (!product) return;
    const r = await fetch(`${API}/trigger-bots/${product.pid}`, {
      method:'POST', headers:{ 'Authorization':`Bearer ${token}` }
    });
    const d = await r.json();
    setMsg({ ok:true, text:`⚡ ${d.message}` });
    onDone();
    setTimeout(() => setMsg(null), 3000);
  };

  const adjQty = delta => setQty(q => Math.max(1, parseInt(q||1)+delta).toString());

  return (
    <div style={{padding:'16px 14px', display:'flex', flexDirection:'column', gap:11}}>
      {/* BUY / SELL toggle */}
      <div style={{display:'flex', borderRadius:5, overflow:'hidden', border:'1px solid var(--border)'}}>
        {["BUY","SELL"].map(s => (
          <button key={s} onClick={() => setSide(s)} style={{
            flex:1, padding:'11px 0', border:'none', cursor:'pointer', transition:'all 0.2s',
            background: side===s ? (s==='BUY' ? 'var(--buy2)' : 'var(--sell2)') : 'var(--bg3)',
            color: side===s ? (s==='BUY'?'#000':'#fff') : 'var(--text3)',
            fontFamily:'var(--ui)', fontWeight:800, fontSize:13, letterSpacing:1.5
          }}>{s==='BUY' ? '▲ BUY' : '▼ SELL'}</button>
        ))}
      </div>

      {/* Order mode */}
      <div style={{display:'flex', gap:5}}>
        {["market","limit"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex:1, padding:'6px 0', borderRadius:4, cursor:'pointer', transition:'all 0.2s',
            background: mode===m ? 'var(--bg4)' : 'transparent',
            border:`1px solid ${mode===m ? 'var(--accent)' : 'var(--border)'}`,
            color: mode===m ? 'var(--accent)' : 'var(--text3)',
            fontFamily:'var(--ui)', fontWeight:700, fontSize:11, letterSpacing:1.5,
            textTransform:'uppercase'
          }}>{m}</button>
        ))}
      </div>

      {/* Current market price card */}
      <div style={{
        padding:'10px 12px', borderRadius:5,
        background:'linear-gradient(135deg, var(--bg4), var(--bg3))',
        border:'1px solid var(--border2)',
        display:'flex', alignItems:'center', justifyContent:'space-between'
      }}>
        <div>
          <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2.5, fontFamily:'var(--ui)', fontWeight:700, marginBottom:2}}>INSTANT PRICE</div>
          <div style={{fontSize:20, fontWeight:700, color:'var(--accent)', letterSpacing:0.5, fontFamily:'var(--mono)'}}>
            ₹{lastPrice ? fmt(lastPrice,2) : '—'}
          </div>
        </div>
        <div style={{
          padding:'6px 12px', borderRadius:4,
          background: side==='BUY' ? 'var(--buy-bg)' : 'var(--sell-bg)',
          border:`1px solid ${side==='BUY'?'rgba(0,200,83,0.3)':'rgba(211,32,72,0.3)'}`,
          color: side==='BUY' ? 'var(--buy)' : 'var(--sell)',
          fontSize:11, fontFamily:'var(--ui)', fontWeight:700, letterSpacing:1
        }}>{mode==='market'?'INSTANT':mode.toUpperCase()}</div>
      </div>

      {/* Limit price input */}
      {mode === 'limit' && (
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
          <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2.5, marginBottom:6, fontFamily:'var(--ui)', fontWeight:700}}>LIMIT PRICE</div>
          <div style={{display:'flex', gap:4}}>
            <input type="number" value={price} onChange={e=>setPrice(e.target.value)}
              placeholder={lastPrice?.toFixed(2) || '0.00'}
              style={{
                flex:1, padding:'9px 10px', borderRadius:4, fontSize:13,
                background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)',
                fontFamily:'var(--mono)', transition:'border-color 0.2s'
              }}
              onFocus={e=>e.target.style.borderColor='var(--accent)'}
              onBlur={e=>e.target.style.borderColor='var(--border)'}
            />
            <button onClick={()=>setPrice(lastPrice?.toFixed(2)||'')} style={{
              padding:'0 10px', background:'var(--bg4)', border:'1px solid var(--border2)',
              borderRadius:4, color:'var(--text2)', fontSize:10, cursor:'pointer',
              fontFamily:'var(--ui)', fontWeight:700, letterSpacing:1
            }}>MKT</button>
          </div>
          <div style={{marginTop:5, fontSize:10, color:'var(--text3)', fontFamily:'var(--ui)'}}>
            Order fills automatically when market price reaches ₹{price||'--'}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2.5, marginBottom:6, fontFamily:'var(--ui)', fontWeight:700}}>QUANTITY</div>
        <div style={{display:'flex', gap:4}}>
          <button onClick={()=>adjQty(-1)} style={{
            padding:'0 13px', background:'var(--bg4)', border:'1px solid var(--border)',
            borderRadius:4, color:'var(--text2)', fontSize:16, cursor:'pointer'
          }}>−</button>
          <input type="number" value={qty} onChange={e=>setQty(e.target.value)} min="1"
            style={{
              flex:1, padding:'9px', borderRadius:4, fontSize:14, fontWeight:700,
              background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)',
              fontFamily:'var(--mono)', textAlign:'center', transition:'border-color 0.2s'
            }}
            onFocus={e=>e.target.style.borderColor='var(--accent)'}
            onBlur={e=>e.target.style.borderColor='var(--border)'}
          />
          <button onClick={()=>adjQty(1)} style={{
            padding:'0 13px', background:'var(--bg4)', border:'1px solid var(--border)',
            borderRadius:4, color:'var(--text2)', fontSize:16, cursor:'pointer'
          }}>+</button>
        </div>
        <div style={{display:'flex', gap:4, marginTop:5}}>
          {[5,10,25,50].map(n => (
            <button key={n} onClick={()=>setQty(n.toString())} style={{
              flex:1, padding:'4px 0', background:'var(--bg4)', border:'1px solid var(--border)',
              borderRadius:3, color:'var(--text3)', fontSize:10, cursor:'pointer',
              fontFamily:'var(--ui)', fontWeight:600, transition:'all 0.15s'
            }}>{n}</button>
          ))}
        </div>
      </div>

      {/* Total */}
      <div style={{
        padding:'9px 12px', borderRadius:4,
        background:'var(--bg4)', border:'1px solid var(--border)',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <span style={{fontSize:10, color:'var(--text3)', fontFamily:'var(--ui)', letterSpacing:2}}>TOTAL COST</span>
        <span style={{fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:'var(--mono)'}}>₹ {fmt(total,2)}</span>
      </div>

      {/* Submit button */}
      <button onClick={placeOrder} disabled={busy} style={{
        padding:'13px', borderRadius:5, cursor:'pointer', border:'none',
        background: side==='BUY'
          ? 'linear-gradient(135deg, #00c853, #007830)'
          : 'linear-gradient(135deg, #e02048, #7a0025)',
        color: side==='BUY' ? '#001a0a' : '#fff',
        fontFamily:'var(--ui)', fontWeight:800, fontSize:14, letterSpacing:1.5,
        transition:'all 0.2s', opacity: busy ? 0.7 : 1,
        boxShadow: side==='BUY'
          ? '0 4px 20px rgba(0,200,83,0.2)'
          : '0 4px 20px rgba(255,77,109,0.2)'
      }}>
        {busy ? '◌ PROCESSING...'
          : mode==='market'
            ? `${side==='BUY'?'▲ BUY INSTANT':'▼ SELL INSTANT'} @ ₹${lastPrice?fmt(lastPrice,2):'--'}`
            : `${side==='BUY'?'▲ PLACE BUY LIMIT':'▼ PLACE SELL LIMIT'} @ ₹${price||'--'}`
        }
      </button>

      {/* Message */}
      {msg && (
        <div style={{
          padding:'8px 12px', borderRadius:4, fontSize:12, animation:'fadeIn 0.2s',
          background: msg.ok ? 'var(--buy-bg)' : 'var(--sell-bg)',
          border:`1px solid ${msg.ok?'rgba(0,200,83,0.3)':'rgba(255,77,109,0.3)'}`,
          color: msg.ok ? 'var(--buy)' : 'var(--sell)', fontFamily:'var(--ui)', fontWeight:600
        }}>{msg.text}</div>
      )}

      {/* Trigger bots */}
      <button onClick={triggerBots} style={{
        padding:'8px', borderRadius:4, cursor:'pointer', border:'1px solid var(--border2)',
        background:'transparent', color:'var(--text3)', fontFamily:'var(--ui)',
        fontWeight:700, fontSize:11, letterSpacing:1.5, transition:'all 0.2s'
      }}
        onMouseEnter={e=>{e.target.style.borderColor='var(--gold)'; e.target.style.color='var(--gold)';}}
        onMouseLeave={e=>{e.target.style.borderColor='var(--border2)'; e.target.style.color='var(--text3)';}}>
        ⚡ TRIGGER MARKET MAKERS
      </button>
    </div>
  );
}

// ── MY ORDERS ─────────────────────────────────────────────────────────────────
function MyOrdersPanel({ token, onRefresh }) {
  const [orders, setOrders] = useState([]);

  const load = useCallback(async () => {
    const r = await fetch(`${API}/my-orders`, { headers:{ 'Authorization':`Bearer ${token}` } });
    if (r.ok) setOrders(await r.json());
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (oid) => {
    await fetch(`${API}/orders/${oid}`, { method:'DELETE', headers:{'Authorization':`Bearer ${token}`} });
    await load(); onRefresh();
  };

  return (
    <div style={{padding:12, display:'flex', flexDirection:'column', gap:8, height:'100%', overflowY:'auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4}}>
        <span style={{fontFamily:'var(--ui)', fontWeight:800, fontSize:11, color:'var(--text2)', letterSpacing:2}}>
          OPEN LIMIT ORDERS
        </span>
        <button onClick={load} style={{
          padding:'4px 10px', background:'var(--bg4)', border:'1px solid var(--border)',
          borderRadius:3, color:'var(--text3)', fontSize:10, cursor:'pointer', fontFamily:'var(--ui)'
        }}>↻ REFRESH</button>
      </div>

      {orders.length === 0 ? (
        <div style={{color:'var(--text3)', fontSize:12, textAlign:'center', padding:'30px 0', fontFamily:'var(--ui)'}}>
          No open orders<br/>
          <span style={{fontSize:11, color:'var(--text3)', marginTop:6, display:'block'}}>
            Place a limit order to see it here
          </span>
        </div>
      ) : orders.map(o => (
        <div key={o.id} style={{
          padding:'10px 12px', background:'var(--bg3)', borderRadius:4,
          border:`1px solid ${o.type==='BUY'?'rgba(0,200,83,0.18)':'rgba(255,77,109,0.18)'}`,
          animation:'slideIn 0.25s ease', display:'flex', flexDirection:'column', gap:7
        }}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{
              padding:'2px 8px', borderRadius:3, fontSize:10, fontWeight:700,
              background: o.type==='BUY'?'var(--buy-bg)':'var(--sell-bg)',
              color: o.type==='BUY'?'var(--buy)':'var(--sell)',
              fontFamily:'var(--ui)', letterSpacing:1.5
            }}>{o.type}</span>
            <span style={{flex:1, fontFamily:'var(--ui)', fontWeight:700, fontSize:12, color:'var(--text)'}}>{o.product_name}</span>
            <span style={{
              fontSize:10, fontFamily:'var(--ui)', fontWeight:700,
              padding:'2px 6px', borderRadius:3,
              background: o.status==='PARTIAL'?'rgba(255,214,0,0.1)':'var(--bg4)',
              color: o.status==='PARTIAL'?'var(--gold)':'var(--text3)'
            }}>{o.status}</span>
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{display:'flex', gap:14}}>
              <div>
                <div style={{fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)'}}>LIMIT</div>
                <div style={{fontSize:13, fontWeight:700, color: o.type==='BUY'?'var(--buy)':'var(--sell)'}}>₹{fmt(o.price)}</div>
              </div>
              <div>
                <div style={{fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)'}}>QTY</div>
                <div style={{fontSize:13, color:'var(--text2)', fontWeight:600}}>{o.quantity}</div>
              </div>
              <div>
                <div style={{fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)'}}>MARKET</div>
                <div style={{fontSize:13, color:'var(--accent)'}}>{o.last_price ? `₹${fmt(o.last_price)}` : '--'}</div>
              </div>
              <div>
                <div style={{fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)'}}>DIST</div>
                <div style={{fontSize:12, color: clr(o.distance_pct)}}>
                  {o.distance_pct >= 0 ? '+' : ''}{fmt(o.distance_pct)}%
                </div>
              </div>
            </div>
            <button onClick={() => cancel(o.id)} style={{
              padding:'5px 10px', background:'var(--sell-bg)', border:'1px solid rgba(255,77,109,0.3)',
              borderRadius:4, color:'var(--sell)', fontSize:11, cursor:'pointer',
              fontFamily:'var(--ui)', fontWeight:700, transition:'all 0.2s'
            }}>CANCEL</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PORTFOLIO ─────────────────────────────────────────────────────────────────
function PortfolioPanel({ portfolio }) {
  if (!portfolio) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'var(--text3)',fontSize:12}}>
      Loading...
    </div>
  );

  const { wallet, holdings=[], holdings_value, total_unrealized, total_realized, total_pnl, net_worth } = portfolio;
  const active = holdings.filter(h => h.quantity > 0 || h.sell_qty > 0);

  const Stat = ({ label, val, color, large }) => (
    <div>
      <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2, fontFamily:'var(--ui)', fontWeight:700, marginBottom:3}}>{label}</div>
      <div style={{fontSize: large?18:13, fontWeight:700, color: color||'var(--text)', fontFamily:'var(--mono)'}}>
        {typeof val==='string' ? val : `₹${fmt(Math.abs(val)??0)}`}
      </div>
    </div>
  );

  return (
    <div style={{padding:'14px 12px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto', height:'100%'}}>
      {/* Net Worth Hero */}
      <div style={{
        padding:'16px', borderRadius:6,
        background:'linear-gradient(135deg, var(--bg4) 0%, var(--bg3) 100%)',
        border:'1px solid var(--border2)',
        boxShadow:'0 0 30px rgba(0,180,216,0.06)'
      }}>
        <div style={{fontSize:9, color:'var(--text3)', letterSpacing:3, fontFamily:'var(--ui)', fontWeight:700, marginBottom:5}}>TOTAL NET WORTH</div>
        <div style={{fontSize:28, fontWeight:700, color:'var(--accent)', fontFamily:'var(--mono)', letterSpacing:0.5}}>
          ₹ {fmt(net_worth, 2)}
        </div>
        <div style={{height:'1px', background:'var(--border)', margin:'12px 0'}}/>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
          <Stat label="WALLET CASH" val={wallet}/>
          <Stat label="HOLDINGS VAL" val={holdings_value} color="var(--accent)"/>
          <Stat label="TOTAL P&L" val={total_pnl} color={clr(total_pnl)}/>
        </div>
      </div>

      {/* P&L Breakdown */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        {[
          ['REALIZED P&L', total_realized, '💰 Closed trades'],
          ['UNREALIZED P&L', total_unrealized, '📊 Open positions'],
        ].map(([label, val, sub]) => (
          <div key={label} style={{
            padding:'12px', borderRadius:5, background:'var(--bg3)',
            border:`1px solid ${val>=0?'rgba(0,200,83,0.15)':'rgba(255,77,109,0.15)'}`
          }}>
            <div style={{fontSize:9, color:'var(--text3)', letterSpacing:2, fontFamily:'var(--ui)', fontWeight:700, marginBottom:6}}>{label}</div>
            <div style={{fontSize:17, fontWeight:700, color:clr(val), fontFamily:'var(--mono)'}}>
              {val>=0?'+':'-'}₹{fmt(Math.abs(val))}
            </div>
            <div style={{fontSize:9, color:'var(--text3)', marginTop:4, fontFamily:'var(--ui)'}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Holdings */}
      <div style={{fontSize:10, color:'var(--text3)', letterSpacing:2, fontFamily:'var(--ui)', fontWeight:700, marginTop:4}}>
        OPEN POSITIONS ({active.length})
      </div>
      {active.length === 0 ? (
        <div style={{color:'var(--text3)', fontSize:12, textAlign:'center', padding:'20px 0', fontFamily:'var(--ui)'}}>
          No positions. Start trading!
        </div>
      ) : active.map(h => (
        <div key={h.product_id} style={{
          padding:'12px', background:'var(--bg3)', borderRadius:5,
          border:'1px solid var(--border)', animation:'fadeIn 0.3s'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:9}}>
            <div>
              <span style={{fontFamily:'var(--ui)', fontWeight:800, fontSize:13, color:'var(--text)'}}>{h.product_name}</span>
              <span style={{marginLeft:8, fontSize:11, color:'var(--text3)'}}>{h.quantity} units</span>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:14, fontWeight:700, color: clr(h.unrealized_pnl), fontFamily:'var(--mono)'}}>
                {h.unrealized_pnl>=0?'+':'-'}₹{fmt(Math.abs(h.unrealized_pnl))}
              </div>
              <div style={{fontSize:10, color: clr(h.pnl_pct)}}>{fmtPct(h.pnl_pct)}</div>
            </div>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:6, marginBottom:8}}>
            {[
              ['MKT', `₹${fmt(h.last_price)}`],
              ['AVG BUY', `₹${fmt(h.avg_buy_price)}`],
              ['VALUE', `₹${fmt(h.value)}`],
              ['INVESTED', `₹${fmt(h.invested)}`],
            ].map(([l,v]) => (
              <div key={l}>
                <div style={{fontSize:8, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)', fontWeight:700}}>{l}</div>
                <div style={{fontSize:11, color:'var(--text)', fontWeight:600}}>{v}</div>
              </div>
            ))}
          </div>
          {/* Realized for this asset */}
          {h.sell_qty > 0 && (
            <div style={{
              paddingTop:8, borderTop:'1px solid var(--border)',
              display:'flex', justifyContent:'space-between', alignItems:'center'
            }}>
              <span style={{fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)', fontWeight:700}}>REALIZED ({h.sell_qty} sold)</span>
              <span style={{fontSize:12, fontWeight:700, color:clr(h.realized_pnl)}}>
                {h.realized_pnl>=0?'+':'-'}₹{fmt(Math.abs(h.realized_pnl))}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default App
// ── TRADE HISTORY ─────────────────────────────────────────────────────────────
function TradeHistoryPanel({ product, token }) {
  const [trades, setTrades] = useState([]);
  const [flash, setFlash]   = useState(null);

  const load = useCallback(async () => {
    if (!product) return;
    const r = await fetch(`${API}/trade-history/${product.pid}`, {
      headers:{'Authorization':`Bearer ${token}`}
    });
    if (r.ok) {
      const data = await r.json();
      setTrades(data);
      if (data.length > 0) setFlash(data[0].id);
    }
  }, [product, token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{height:'100%', overflowY:'auto'}}>
      <div style={{
        position:'sticky', top:0, padding:'8px 12px',
        background:'var(--bg2)', borderBottom:'1px solid var(--border)', zIndex:1,
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <span style={{fontFamily:'var(--ui)', fontWeight:800, fontSize:10, color:'var(--text3)', letterSpacing:2}}>
          TRADE HISTORY — {product?.name || '--'}
        </span>
        <button onClick={load} style={{
          padding:'3px 8px', background:'var(--bg4)', border:'1px solid var(--border)',
          borderRadius:3, color:'var(--text3)', fontSize:9, cursor:'pointer', fontFamily:'var(--ui)'
        }}>↻</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1.2fr 1fr 0.6fr 0.9fr 0.9fr', padding:'5px 12px', fontSize:9, color:'var(--text3)', letterSpacing:1.5, fontFamily:'var(--ui)', fontWeight:700, borderBottom:'1px solid var(--border)'}}>
        {['TIME','PRICE','QTY','BUYER','SELLER'].map(h => <span key={h}>{h}</span>)}
      </div>
      {trades.slice(0,60).map((t, i) => (
        <div key={t.id} style={{
          display:'grid', gridTemplateColumns:'1.2fr 1fr 0.6fr 0.9fr 0.9fr',
          padding:'5px 12px', fontSize:11,
          borderBottom:'1px solid rgba(26,45,70,0.4)',
          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.012)',
          animation: t.id === flash && i === 0 ? 'flashUp 0.8s ease' : 'none'
        }}>
          <span style={{color:'var(--text3)', fontFamily:'var(--ui)', fontSize:9}}>
            {t.timestamp ? new Date(t.timestamp).toLocaleTimeString() : '--'}
          </span>
          <span style={{color:'var(--accent)', fontWeight:700}}>₹{fmt(t.price)}</span>
          <span style={{color:'var(--text2)'}}>{t.quantity}</span>
          <span style={{color:'var(--buy)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.buyer}</span>
          <span style={{color:'var(--sell)', fontSize:10, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{t.seller}</span>
        </div>
      ))}
    </div>
  );
}

// ── MAIN TERMINAL ─────────────────────────────────────────────────────────────
function MainTerminal({ token, username, onLogout }) {
  const [products,  setProducts]  = useState([]);
  const [selPid,    setSelPid]    = useState(null);
  const [history,   setHistory]   = useState([]);
  const [book,      setBook]      = useState({bids:[],asks:[]});
  const [portfolio, setPortfolio] = useState(null);
  const [rightTab,  setRightTab]  = useState("trade");
  const [wsStatus,  setWsStatus]  = useState("connecting");
  const [notification, setNotif]  = useState(null);
  const wsRef = useRef(null);
  const authH = { 'Authorization': `Bearer ${token}` };

  const selProduct = products.find(p => p.pid === selPid);
  const lastPrice  = history.length > 0 ? history[history.length-1].price : selProduct?.last_price;

  const loadProducts  = useCallback(() =>
    fetch(`${API}/products`).then(r=>r.json()).then(setProducts).catch(()=>{}), []);
  const loadBook      = useCallback(() => {
    if (!selPid) return;
    fetch(`${API}/order-book/${selPid}`).then(r=>r.json()).then(setBook).catch(()=>{});
  }, [selPid]);
  const loadHistory   = useCallback(() => {
    if (!selPid) return;
    fetch(`${API}/price-history/${selPid}`).then(r=>r.json()).then(setHistory).catch(()=>{});
  }, [selPid]);
  const loadPortfolio = useCallback(() =>
    fetch(`${API}/portfolio`, {headers:authH}).then(r=>r.json()).then(setPortfolio).catch(()=>{}), [token]);

  const refreshAll = useCallback(() => {
    loadProducts(); loadBook(); loadHistory(); loadPortfolio();
  }, [loadProducts, loadBook, loadHistory, loadPortfolio]);

  useEffect(() => { loadProducts(); loadPortfolio(); }, []);
  useEffect(() => { if (selPid) { loadBook(); loadHistory(); } }, [selPid]);
  useEffect(() => {
    if (products.length > 0 && !selPid) setSelPid(products[0].pid);
  }, [products]);

  // WebSocket connection
  useEffect(() => {
    let alive = true;
    const connect = () => {
      if (!alive) return;
      const ws = new WebSocket(WS);
      wsRef.current = ws;
      ws.onopen  = () => setWsStatus("live");
      ws.onclose = () => { setWsStatus("reconnecting"); if (alive) setTimeout(connect, 2500); };
      ws.onerror = () => ws.close();
      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === "TRADE") {
            if (msg.product_id === selPid) {
              setHistory(h => {
                const next = [...h, { price:msg.price, ts:msg.timestamp }];
                return next.slice(-200);
              });
              setNotif(msg);
              setTimeout(() => setNotif(null), 3000);
            }
            loadProducts(); loadPortfolio();
          }
          if (msg.type === "UPDATE_BOOK" || msg.type === "BOT_ORDER") loadBook();
        } catch {}
      };
    };
    connect();
    return () => { alive = false; wsRef.current?.close(); };
  }, [selPid]);

  const StatusDot = () => (
    <div style={{display:'flex', alignItems:'center', gap:5}}>
      <div style={{
        width:7, height:7, borderRadius:'50%',
        background: wsStatus==='live'?'var(--buy)':wsStatus==='reconnecting'?'var(--gold)':'#555',
        animation: wsStatus==='live'?'pulse 2.5s infinite':'none',
        boxShadow: wsStatus==='live'?'0 0 8px rgba(0,230,118,0.7)':'none'
      }}/>
      <span style={{fontSize:9, color:'var(--text3)', fontFamily:'var(--ui)', fontWeight:700, letterSpacing:1.5}}>
        {wsStatus.toUpperCase()}
      </span>
    </div>
  );

  return (
    <div style={{width:'100vw', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)'}}>
      {/* ── TOPBAR ── */}
      <div style={{
        height:46, display:'flex', alignItems:'center', padding:'0 14px', gap:14,
        background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0, zIndex:10
      }}>
        {/* Logo */}
        <div style={{
          fontFamily:'var(--ui)', fontWeight:900, fontSize:15, letterSpacing:2.5, flexShrink:0,
          background:'linear-gradient(130deg, #00b4d8, #00e676)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
        }}>⬡ QUANT v11</div>
        <div style={{width:1, height:22, background:'var(--border)', flexShrink:0}}/>
        <StatusDot/>
        <div style={{width:1, height:22, background:'var(--border)', flexShrink:0}}/>

        {/* Market ticker row */}
        <div style={{flex:1, display:'flex', gap:12, overflow:'hidden', alignItems:'center'}}>
          {products.map(p => (
            <div key={p.pid} onClick={() => setSelPid(p.pid)} style={{
              display:'flex', gap:7, alignItems:'center', cursor:'pointer',
              padding:'4px 10px', borderRadius:4, flexShrink:0, transition:'all 0.2s',
              background: selPid===p.pid ? 'var(--bg4)' : 'transparent',
              border: `1px solid ${selPid===p.pid ? 'var(--border2)' : 'transparent'}`
            }}>
              <span style={{fontFamily:'var(--ui)', fontWeight:700, fontSize:11, color: selPid===p.pid?'var(--accent)':'var(--text2)'}}>{p.name}</span>
              <span style={{fontWeight:700, fontSize:12}}>{p.last_price ? `₹${fmt(p.last_price)}` : '--'}</span>
              <span style={{fontSize:10, color:clr(p.change_pct)}}>{fmtPct(p.change_pct)}</span>
            </div>
          ))}
        </div>

        {/* Live trade notification */}
        {notification && (
          <div style={{
            padding:'4px 10px', borderRadius:4, fontSize:10, animation:'slideIn 0.2s',
            background: notification.buyer===username ? 'var(--buy-bg)' : 'var(--sell-bg)',
            border:`1px solid ${notification.buyer===username ? 'rgba(0,200,83,0.3)' : 'rgba(255,77,109,0.3)'}`,
            color: notification.buyer===username ? 'var(--buy)' : 'var(--sell)',
            fontFamily:'var(--ui)', fontWeight:700, letterSpacing:0.5, flexShrink:0
          }}>
            TRADE ₹{fmt(notification.price)} ×{notification.quantity}
          </div>
        )}

        <div style={{width:1, height:22, background:'var(--border)', flexShrink:0}}/>
        <div style={{display:'flex', alignItems:'center', gap:10, flexShrink:0}}>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:12, fontFamily:'var(--ui)', fontWeight:700, color:'var(--text)'}}>{username}</div>
            <div style={{fontSize:10, color:'var(--text3)'}}>₹{portfolio ? fmt(portfolio.wallet) : '--'}</div>
          </div>
          <button onClick={onLogout} style={{
            padding:'5px 12px', background:'transparent', border:'1px solid var(--border)',
            borderRadius:4, color:'var(--text3)', fontSize:10, cursor:'pointer',
            fontFamily:'var(--ui)', fontWeight:700, letterSpacing:1, transition:'all 0.2s'
          }}
            onMouseEnter={e=>{e.target.style.borderColor='var(--sell)'; e.target.style.color='var(--sell)';}}
            onMouseLeave={e=>{e.target.style.borderColor='var(--border)'; e.target.style.color='var(--text3)';}}>
            EXIT
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{flex:1, display:'flex', overflow:'hidden'}}>
        {/* LEFT SIDEBAR: Products */}
        <div style={{
          width:174, borderRight:'1px solid var(--border)', flexShrink:0,
          display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg2)'
        }}>
          <div style={{padding:'8px 12px', fontSize:9, color:'var(--text3)', letterSpacing:3, fontFamily:'var(--ui)', fontWeight:800, borderBottom:'1px solid var(--border)'}}>
            MARKETS
          </div>
          {products.map(p => (
            <div key={p.pid} onClick={() => setSelPid(p.pid)} style={{
              padding:'10px 12px', cursor:'pointer', transition:'all 0.15s',
              background: selPid===p.pid ? 'var(--bg4)' : 'transparent',
              borderLeft:`3px solid ${selPid===p.pid ? 'var(--accent)' : 'transparent'}`,
              borderBottom:'1px solid rgba(26,45,70,0.5)'
            }}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <span style={{fontFamily:'var(--ui)', fontWeight:700, fontSize:12, color: selPid===p.pid?'var(--accent)':'var(--text)'}}>{p.name}</span>
                <span style={{fontSize:10, color:clr(p.change_pct)}}>{fmtPct(p.change_pct)}</span>
              </div>
              <div style={{fontSize:14, fontWeight:700, color:'var(--text)', marginTop:2, fontFamily:'var(--mono)'}}>
                ₹{p.last_price ? fmt(p.last_price) : '--'}
              </div>
            </div>
          ))}
        </div>

        {/* CENTER: Chart + Book */}
        <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0}}>
          {/* Chart header */}
          <div style={{
            padding:'8px 16px', borderBottom:'1px solid var(--border)',
            display:'flex', alignItems:'center', gap:14, flexShrink:0, background:'var(--bg2)'
          }}>
            <div>
              <span style={{fontFamily:'var(--ui)', fontWeight:900, fontSize:18, color:'var(--text)'}}>{selProduct?.name || '—'}</span>
            </div>
            <div style={{fontFamily:'var(--mono)', fontSize:24, fontWeight:700, color:'var(--accent)', letterSpacing:0.5}}>
              ₹{lastPrice ? fmt(lastPrice) : '—'}
            </div>
            {history.length >= 2 && (() => {
              const chg    = lastPrice - history[0].price;
              const chgPct = (chg / history[0].price) * 100;
              return (
                <span style={{fontSize:13, fontWeight:700, color:clr(chg)}}>
                  {chg >= 0 ? '▲' : '▼'} {fmtPct(chgPct)}
                </span>
              );
            })()}
            <div style={{flex:1}}/>
            <button onClick={refreshAll} style={{
              padding:'5px 11px', background:'var(--bg4)', border:'1px solid var(--border)',
              borderRadius:4, color:'var(--text3)', fontSize:10, cursor:'pointer', fontFamily:'var(--ui)', fontWeight:700
            }}>↻ REFRESH</button>
          </div>

          {/* Chart + Order Book */}
          <div style={{flex:1, display:'flex', overflow:'hidden', minHeight:0}}>
            <div style={{flex:1, padding:'8px 10px 4px', overflow:'hidden', minWidth:0}}>
              <PriceChart history={history}/>
            </div>
            <div style={{
              width:188, borderLeft:'1px solid var(--border)', flexShrink:0,
              background:'var(--bg2)', overflow:'hidden', display:'flex', flexDirection:'column'
            }}>
              <div style={{padding:'6px 10px', fontSize:9, color:'var(--text3)', letterSpacing:2.5, fontFamily:'var(--ui)', fontWeight:800, borderBottom:'1px solid var(--border)'}}>
                ORDER BOOK
              </div>
              <div style={{flex:1, overflow:'hidden'}}>
                <OrderBook orderBook={book} lastPrice={lastPrice}/>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Action Panel */}
        <div style={{
          width:326, borderLeft:'1px solid var(--border)', flexShrink:0,
          display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg2)'
        }}>
          {/* Tabs */}
          <div style={{display:'flex', borderBottom:'1px solid var(--border)', flexShrink:0}}>
            {[['trade','TRADE'],['orders','ORDERS'],['portfolio','PNL'],['history','HISTORY']].map(([id, label]) => (
              <button key={id} onClick={() => setRightTab(id)} style={{
                flex:1, padding:'11px 0', border:'none', background:'none',
                borderBottom: rightTab===id ? '2px solid var(--accent)' : '2px solid transparent',
                color: rightTab===id ? 'var(--accent)' : 'var(--text3)',
                fontFamily:'var(--ui)', fontWeight:800, fontSize:10, letterSpacing:1.5,
                cursor:'pointer', transition:'all 0.2s', marginBottom:-1
              }}>{label}</button>
            ))}
          </div>
          <div style={{flex:1, overflow:'hidden'}}>
            {rightTab === 'trade'     && <TradePanel product={selProduct} token={token} lastPrice={lastPrice} onDone={refreshAll}/>}
            {rightTab === 'orders'    && <MyOrdersPanel token={token} onRefresh={refreshAll}/>}
            {rightTab === 'portfolio' && <PortfolioPanel portfolio={portfolio}/>}
            {rightTab === 'history'   && <TradeHistoryPanel product={selProduct} token={token}/>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [token,    setToken]    = useState(() => localStorage.getItem('qt_token') || null);
  const [username, setUsername] = useState(() => localStorage.getItem('qt_user')  || '');

  const handleAuth = (tok, name) => {
    setToken(tok); setUsername(name);
    localStorage.setItem('qt_token', tok);
    localStorage.setItem('qt_user',  name);
  };
  const handleLogout = () => {
    setToken(null); setUsername('');
    localStorage.removeItem('qt_token');
    localStorage.removeItem('qt_user');
  };

  return (
    <>
      <GlobalStyle/>
      {token
        ? <MainTerminal token={token} username={username} onLogout={handleLogout}/>
        : <AuthScreen onAuth={handleAuth}/>
      }
    </>
  );
}
