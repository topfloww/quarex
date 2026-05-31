import React, { useState } from 'react';
import Sidebar, { MobileNav } from './components/Sidebar';
import TopBar from './components/TopBar';
import Lock from './components/Lock';
import Overview from './pages/Overview';
import DrivingPage from './pages/DrivingPage';
import BudgetPage from './pages/BudgetPage';
import TradingPage from './pages/TradingPage';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('qx_ok') === '1');
  const [page, setPage] = useState('overview');

  const unlock = () => { sessionStorage.setItem('qx_ok','1'); setUnlocked(true); };
  if (!unlocked) return <Lock onUnlock={unlock} />;

  const pages = { overview:<Overview/>, driving:<DrivingPage/>, budget:<BudgetPage/>, trading:<TradingPage/> };

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar page={page} setPage={setPage} />
      <div className="mobile-nav"><MobileNav page={page} setPage={setPage} /></div>
      <TopBar page={page} />
      <main style={{
        flex:1,
        marginLeft:'var(--sidebar-w)',
        marginTop:'var(--topbar-h)',
        padding:'24px 28px',
        maxWidth: 1200,
        width: '100%',
      }}>
        {pages[page]}
      </main>
    </div>
  );
}
