import React, { useState } from 'react';

const PIN = '2012';

export default function Lock({ onUnlock }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = (val) => {
    if (val.length < 4) return;
    if (val === PIN) {
      onUnlock();
    } else {
      setShake(true);
      setError(true);
      setInput('');
      setTimeout(() => { setShake(false); setError(false); }, 600);
    }
  };

  const press = (d) => {
    if (input.length >= 4) return;
    const next = input + d;
    setInput(next);
    attempt(next);
  };

  const del = () => setInput(i => i.slice(0, -1));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, background: 'var(--accent)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>Q</div>
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Quarex</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: '0.04em' }}>Enter PIN</div>
      </div>

      {/* Dots */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 32,
        animation: shake ? 'shake 0.4s' : 'none',
      }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: '50%',
            background: i < input.length ? (error ? 'var(--red)' : 'var(--accent)') : 'var(--bg-4)',
            border: `1px solid ${i < input.length ? 'transparent' : 'var(--border-2)'}`,
            transition: 'background 0.15s',
          }} />
        ))}
      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, width: 200 }}>
        {[1,2,3,4,5,6,7,8,9].map(d => (
          <button key={d} onClick={() => press(String(d))} style={{
            height: 56, borderRadius: 'var(--radius)',
            background: 'var(--bg-3)', border: '1px solid var(--border-2)',
            color: 'var(--text)', fontSize: 18, fontFamily: 'var(--mono)',
            fontWeight: 400, transition: 'all 0.1s',
          }}
          onMouseDown={e => e.currentTarget.style.background = 'var(--bg-5)'}
          onMouseUp={e => e.currentTarget.style.background = 'var(--bg-3)'}
          >{d}</button>
        ))}
        <div />
        <button onClick={() => press('0')} style={{
          height: 56, borderRadius: 'var(--radius)',
          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
          color: 'var(--text)', fontSize: 18, fontFamily: 'var(--mono)',
        }}>0</button>
        <button onClick={del} style={{
          height: 56, borderRadius: 'var(--radius)',
          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
          color: 'var(--text-2)', fontSize: 16,
        }}>⌫</button>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
