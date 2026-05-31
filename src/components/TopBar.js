import React, { useState, useEffect } from 'react';

const LABELS = { overview:'Overview', driving:'Driving', budget:'Budget', trading:'Trading P&L' };

export default function TopBar({ page }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{
      position:'fixed', top:0, left:'var(--sidebar-w)', right:0, height:'var(--topbar-h)', zIndex:9,
      background:'var(--bg)', borderBottom:'1px solid var(--border)',
      display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 24px',
    }}>
      <span style={{ fontSize:11, color:'var(--text-3)', letterSpacing:'0.05em', textTransform:'uppercase' }}>{LABELS[page]}</span>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <span style={{ fontSize:11, color:'var(--text-3)' }}>
          {time.toLocaleDateString('en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
        </span>
        <span style={{ fontFamily:'var(--mono)', fontSize:13, color:'var(--text-2)', minWidth:65, textAlign:'right' }}>
          {time.toLocaleTimeString('de-DE')}
        </span>
      </div>
    </div>
  );
}
