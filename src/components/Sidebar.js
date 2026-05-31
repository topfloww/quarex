import React, { useState } from 'react';
import { useStore } from '../utils/DataContext';

const NAV = [
  { id:'overview', label:'Overview' },
  { id:'driving',  label:'Driving'  },
  { id:'budget',   label:'Budget'   },
  { id:'trading',  label:'Trading'  },
];

function NavItems({ page, setPage, onNav }) {
  return NAV.map(n => (
    <button key={n.id} onClick={() => { setPage(n.id); onNav && onNav(); }} style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      width:'100%', padding:'8px 10px', borderRadius:'var(--radius)',
      background: page===n.id ? 'var(--bg-4)' : 'transparent',
      color: page===n.id ? 'var(--text)' : 'var(--text-2)',
      marginBottom:2, fontSize:13, fontWeight: page===n.id ? 500 : 400,
      border: page===n.id ? '1px solid var(--border-2)' : '1px solid transparent',
      textAlign:'left',
    }}>
      {n.label}
      {page===n.id && <div style={{ width:4, height:4, borderRadius:'50%', background:'var(--accent)' }}/>}
    </button>
  ));
}

export function MobileNav({ page, setPage }) {
  const [open, setOpen] = useState(false);
  const { syncStatus } = useStore();
  const statusColor = syncStatus==='online' ? 'var(--green)' : syncStatus==='offline' ? 'var(--amber)' : 'var(--text-3)';
  const statusLabel = syncStatus==='online' ? 'Synced' : syncStatus==='offline' ? 'Offline' : 'Connecting';

  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:19 }}/>}
      <div style={{ position:'fixed', top:0, left:0, right:0, height:52, zIndex:20, background:'var(--bg-2)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ width:20, height:20, background:'var(--accent)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>Q</div>
            <span style={{ fontSize:13, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Quarex</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:4, paddingLeft:6, borderLeft:'1px solid var(--border-2)' }}>
            <div style={{ width:5, height:5, borderRadius:'50%', background:statusColor, flexShrink:0 }}/>
            <span style={{ fontSize:10, color:statusColor, letterSpacing:'0.04em', textTransform:'uppercase' }}>{statusLabel}</span>
          </div>
        </div>
        <button onClick={() => setOpen(o => !o)} style={{ background:'transparent', color:'var(--text-2)', fontSize:18, lineHeight:1, padding:'5px 9px', border:'1px solid var(--border-2)', borderRadius:'var(--radius)' }}>☰</button>
      </div>
      {open && (
        <div style={{ position:'fixed', top:52, left:0, right:0, background:'var(--bg-2)', borderBottom:'1px solid var(--border)', zIndex:20, padding:'10px' }}>
          <NavItems page={page} setPage={setPage} onNav={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}

export default function Sidebar({ page, setPage }) {
  const { syncStatus } = useStore();
  const statusColor = syncStatus==='online' ? 'var(--green)' : syncStatus==='offline' ? 'var(--amber)' : 'var(--text-3)';
  const statusLabel = syncStatus==='online' ? 'Cloud · Synced' : syncStatus==='offline' ? 'Offline · Local' : 'Connecting...';

  return (
    <aside className="desktop-sidebar" style={{ width:200, minHeight:'100vh', background:'var(--bg-2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', position:'fixed', top:0, left:0, bottom:0, zIndex:10 }}>
      <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:20, height:20, background:'var(--accent)', borderRadius:2, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'#fff' }}>Q</div>
          <span style={{ fontSize:13, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Quarex</span>
        </div>
      </div>
      <nav style={{ flex:1, padding:'12px 10px' }}>
        <NavItems page={page} setPage={setPage} />
      </nav>
      <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
          <div style={{ width:5, height:5, borderRadius:'50%', background:statusColor }}/>
          <span style={{ fontSize:10, color:statusColor, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {syncStatus==='online' ? 'Cloud' : syncStatus==='offline' ? 'Offline' : 'Sync...'}
          </span>
        </div>
        <div style={{ fontSize:10, color:'var(--text-3)' }}>{statusLabel}</div>
      </div>
    </aside>
  );
}
