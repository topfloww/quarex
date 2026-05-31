import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line, Cell, ComposedChart, Area } from 'recharts';
import { useStore } from '../utils/DataContext';
import { formatEUR, formatDate, today } from '../utils/storage';

const SETUPS = ['Long','Short','Scalp','Swing','Other'];
const EMPTY  = { date:today(), symbol:'', setup:'Long', entry:'', exit:'', pnl:'', notes:'' };

function getWeek(date) {
  const d = new Date(date);
  d.setHours(0,0,0,0);
  d.setDate(d.getDate()+3-(d.getDay()+6)%7);
  const w1 = new Date(d.getFullYear(),0,4);
  return 1+Math.round(((d-w1)/86400000-3+(w1.getDay()+6)%7)/7);
}

const CT = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'var(--bg-4)',border:'1px solid var(--border-2)',borderRadius:4,padding:'8px 12px',fontSize:12}}>
      <div style={{color:'var(--text-2)',marginBottom:4,fontSize:10,textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</div>
      {payload.map(p=>(
        <div key={p.dataKey} style={{color:p.color||'var(--text)',fontFamily:'var(--mono)',marginBottom:2}}>
          {p.name}: {typeof p.value==='number'&&p.name!=='Trade #'?formatEUR(p.value):p.value}
        </div>
      ))}
    </div>
  );
};

function PnLCalendar({ trades }) {
  const [viewDate, setViewDate] = useState(new Date());
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year,month+1,0).getDate();
  const firstDay = (new Date(year,month,1).getDay()+6)%7;
  const todayStr = today();

  const byDay = useMemo(()=>{
    const map={};
    trades.forEach(t=>{
      if(!t.date) return;
      const d=t.date.split('T')[0];
      if(!map[d]) map[d]={pnl:0,count:0};
      map[d].pnl+=Number(t.pnl||0); map[d].count++;
    });
    return map;
  },[trades]);

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
        <button onClick={()=>setViewDate(new Date(year,month-1))} className="btn-ghost" style={{padding:'4px 10px'}}>←</button>
        <span style={{fontSize:13,fontWeight:500}}>{viewDate.toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</span>
        <button onClick={()=>setViewDate(new Date(year,month+1))} className="btn-ghost" style={{padding:'4px 10px'}}>→</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d=>(
          <div key={d} style={{textAlign:'center',fontSize:9,color:'var(--text-3)',padding:'3px 0',letterSpacing:'0.06em',textTransform:'uppercase'}}>{d}</div>
        ))}
        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
        {Array.from({length:daysInMonth}).map((_,i)=>{
          const day=i+1;
          const ds=`${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const data=byDay[ds];
          const isToday=ds===todayStr;
          const color=data?(data.pnl>=0?'var(--green)':'var(--red)'):null;
          return (
            <div key={day} style={{aspectRatio:'1',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',borderRadius:'var(--radius)',background:data?(data.pnl>=0?'var(--green-dim)':'var(--red-dim)'):'transparent',border:isToday?'1px solid var(--accent)':`1px solid ${data?'transparent':'var(--border)'}`,padding:2}}>
              <span style={{fontSize:10,color:data?color:'var(--text-3)',fontWeight:isToday?600:400}}>{day}</span>
              {data&&<span style={{fontSize:8,fontFamily:'var(--mono)',color,lineHeight:1.2}}>{data.pnl>=0?'+':''}{data.pnl.toFixed(0)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyTable({ trades }) {
  const weeks = useMemo(()=>{
    const map={};
    trades.forEach(t=>{
      if(!t.date) return;
      const d=new Date(t.date);
      const w=`${d.getFullYear()}-W${String(getWeek(t.date)).padStart(2,'0')}`;
      if(!map[w]) map[w]={week:w,pnl:0,count:0,wins:0};
      map[w].pnl+=Number(t.pnl||0); map[w].count++;
      if(Number(t.pnl)>=0) map[w].wins++;
    });
    return Object.values(map).sort((a,b)=>b.week.localeCompare(a.week)).slice(0,12);
  },[trades]);

  if(weeks.length===0) return <div style={{color:'var(--text-3)',fontSize:12}}>No trades yet</div>;
  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 60px 60px 80px',gap:8,padding:'4px 8px',marginBottom:4}}>
        {['Week','Trades','Win%','P&L'].map(h=><div key={h} className="label">{h}</div>)}
      </div>
      {weeks.map(w=>(
        <div key={w.week} style={{display:'grid',gridTemplateColumns:'1fr 60px 60px 80px',gap:8,padding:'8px',background:'var(--bg-3)',borderRadius:'var(--radius)',marginBottom:3,borderLeft:`2px solid ${w.pnl>=0?'var(--green)':'var(--red)'}`,alignItems:'center'}}>
          <span style={{fontSize:12,fontFamily:'var(--mono)'}}>{w.week}</span>
          <span style={{fontSize:12,color:'var(--text-2)'}}>{w.count}</span>
          <span style={{fontSize:12,color:'var(--text-2)'}}>{((w.wins/w.count)*100).toFixed(0)}%</span>
          <span style={{fontSize:12,fontFamily:'var(--mono)',fontWeight:500,color:w.pnl>=0?'var(--green)':'var(--red)'}}>{w.pnl>=0?'+':''}{formatEUR(w.pnl)}</span>
        </div>
      ))}
    </div>
  );
}

// ── Interest Calculator Tab ───────────────────────────────────
function InterestTab({ trades }) {
  const [capital, setCapital]   = useState('10000');
  const [rate, setRate]         = useState('2.00');   // current ECB ~3.75%
  const [years, setYears]       = useState('1');
  const [compound, setCompound] = useState(true);

  const r   = parseFloat(rate)||0;
  const cap = parseFloat(capital)||0;
  const yr  = parseFloat(years)||1;

  const rateDecimal  = r / 100;
  const dailyRate    = rateDecimal / 365;
  const monthlyRate  = rateDecimal / 12;

  const perDay       = cap * dailyRate;
  const perMonth     = cap * monthlyRate;
  const totalInterest= compound
    ? cap * (Math.pow(1 + rateDecimal, yr) - 1)
    : cap * rateDecimal * yr;
  const finalAmount  = cap + totalInterest;

  // Build yearly compound curve vs trading equity curve
  const compoundCurve = useMemo(()=>{
    const points=[];
    for(let m=0;m<=Math.min(yr*12,60);m++){
      const v = compound
        ? cap * Math.pow(1 + monthlyRate, m)
        : cap + cap * monthlyRate * m;
      points.push({ month:`M${m}`, RiskFree: parseFloat(v.toFixed(2)) });
    }
    return points;
  },[cap,r,yr,compound]);

  // Overlay trading P&L as cumulative equity on same timeline
  const tradingSorted = useMemo(()=>[...trades].sort((a,b)=>new Date(a.date)-new Date(b.date)),[trades]);

  const comparisonCurve = useMemo(()=>{
    if(tradingSorted.length===0) return compoundCurve;
    const start = new Date(tradingSorted[0].date);
    let cumTrade = cap;
    const tradeMap={};
    tradingSorted.forEach(t=>{
      const d=new Date(t.date);
      const mIdx = Math.round((d-start)/(1000*60*60*24*30.44));
      tradeMap[mIdx]=(tradeMap[mIdx]||0)+Number(t.pnl||0);
    });
    return compoundCurve.map((p,i)=>{
      cumTrade += (tradeMap[i]||0);
      return { ...p, Trading: parseFloat(cumTrade.toFixed(2)) };
    });
  },[compoundCurve, tradingSorted, cap]);

  const tradingTotal = tradingSorted.reduce((s,t)=>s+Number(t.pnl||0),0);
  const tradingVsRf  = tradingTotal - totalInterest;

  return (
    <div>
      {/* Input row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        <div className="card">
          <div className="label" style={{marginBottom:7}}>Capital (€)</div>
          <input type="number" value={capital} onChange={e=>setCapital(e.target.value)} placeholder="10000" style={{fontSize:16,fontFamily:'var(--mono)',background:'transparent',border:'none',color:'var(--text)',padding:0,fontWeight:500}}/>
          <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>Principal amount</div>
        </div>
        <div className="card">
          <div className="label" style={{marginBottom:7}}>Interest Rate (%)</div>
          <input type="number" value={rate} onChange={e=>setRate(e.target.value)} placeholder="3.75" step="0.01" style={{fontSize:16,fontFamily:'var(--mono)',background:'transparent',border:'none',color:'var(--amber)',padding:0,fontWeight:500}}/>
          <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>Annual rate (ECB ~2.00%)</div>
        </div>
        <div className="card">
          <div className="label" style={{marginBottom:7}}>Timeframe (Years)</div>
          <input type="number" value={years} onChange={e=>setYears(e.target.value)} placeholder="1" step="0.5" style={{fontSize:16,fontFamily:'var(--mono)',background:'transparent',border:'none',color:'var(--text)',padding:0,fontWeight:500}}/>
          <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>Projection period</div>
        </div>
        <div className="card" style={{display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
          <div className="label" style={{marginBottom:7}}>Compounding</div>
          <div style={{display:'flex',gap:6}}>
            {[[true,'Compound'],[false,'Simple']].map(([v,l])=>(
              <button key={l} onClick={()=>setCompound(v)} style={{flex:1,padding:'5px',borderRadius:'var(--radius)',fontSize:11,background:compound===v?'var(--accent-dim)':'var(--bg-3)',color:compound===v?'var(--accent)':'var(--text-3)',border:`1px solid ${compound===v?'rgba(74,124,247,0.3)':'var(--border)'}`}}>{l}</button>
            ))}
          </div>
          <div style={{fontSize:10,color:'var(--text-3)'}}>Interest method</div>
        </div>
      </div>

      {/* Result metrics */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Per Day',    val:formatEUR(perDay),        color:'var(--text-2)',   sub:`at ${r}% p.a.`},
          {label:'Per Month',  val:formatEUR(perMonth),      color:'var(--accent)',   sub:'estimated payout'},
          {label:'Per Year',   val:formatEUR(cap*rateDecimal),color:'var(--accent)',  sub:'gross interest'},
          {label:`After ${yr}y`,val:formatEUR(finalAmount),  color:'var(--green)',    sub:`+${formatEUR(totalInterest)}`},
          {label:'vs. Trading',val:(tradingVsRf>=0?'+':'')+formatEUR(tradingVsRf), color:tradingVsRf>=0?'var(--green)':'var(--red)', sub:trades.length>0?`${trades.length} trades logged`:'No trades yet'},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:'12px 14px',borderTop:`2px solid ${s.color}`,borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
            <div className="label" style={{marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:15,fontWeight:500,color:s.color}}>{s.val}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Comparison chart */}
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div>
            <div className="label" style={{marginBottom:2}}>Risk-Free vs. Trading Performance</div>
            <div style={{fontSize:11,color:'var(--text-3)'}}>Cumulative value starting from {formatEUR(cap)} capital</div>
          </div>
          <div style={{display:'flex',gap:14}}>
            {[['var(--amber)','Risk-Free'],['var(--accent)','Trading']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:5,height:5,borderRadius:'50%',background:c}}/>
                <span style={{fontSize:10,color:'var(--text-3)'}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={comparisonCurve} margin={{top:5,right:5,bottom:0,left:-10}}>
            <defs>
              <linearGradient id="gRF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--amber)" stopOpacity={0.15}/>
                <stop offset="100%" stopColor="var(--amber)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gTR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.15}/>
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
            <YAxis stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${(v/1000).toFixed(1)}k`}/>
            <Tooltip content={<CT/>}/>
            <ReferenceLine y={cap} stroke="var(--border-2)" strokeDasharray="4 4"/>
            <Area type="monotone" dataKey="RiskFree" stroke="var(--amber)" strokeWidth={1.5} fill="url(#gRF)" name="Risk-Free" dot={false}/>
            {comparisonCurve.some(p=>p.Trading!==undefined) && (
              <Area type="monotone" dataKey="Trading" stroke="var(--accent)" strokeWidth={1.5} fill="url(#gTR)" name="Trading" dot={false}/>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Compound table */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div className="card">
          <div className="label" style={{marginBottom:14}}>Year-by-Year Projection</div>
          <div style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr 1fr',gap:8,padding:'4px 8px',marginBottom:4}}>
            {['Year','Interest','Total','Growth'].map(h=><div key={h} className="label">{h}</div>)}
          </div>
          {Array.from({length:Math.min(Math.ceil(yr),10)},(_,i)=>i+1).map(y=>{
            const prev = compound ? cap*Math.pow(1+rateDecimal,y-1) : cap+cap*rateDecimal*(y-1);
            const curr = compound ? cap*Math.pow(1+rateDecimal,y)   : cap+cap*rateDecimal*y;
            const interest = curr-prev;
            const growth = ((curr-cap)/cap*100).toFixed(2);
            return (
              <div key={y} style={{display:'grid',gridTemplateColumns:'60px 1fr 1fr 1fr',gap:8,padding:'7px 8px',background:'var(--bg-3)',borderRadius:'var(--radius)',marginBottom:3,alignItems:'center'}}>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text-2)'}}>Y{y}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--green)'}}>{formatEUR(interest)}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--text)'}}>{formatEUR(curr)}</span>
                <span style={{fontFamily:'var(--mono)',fontSize:11,color:'var(--amber)'}}>+{growth}%</span>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="label" style={{marginBottom:14}}>Monthly Payout Estimate</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:16,lineHeight:1.7}}>
            With <span style={{color:'var(--text)',fontFamily:'var(--mono)'}}>{formatEUR(cap)}</span> at <span style={{color:'var(--amber)',fontFamily:'var(--mono)'}}>{r}%</span> p.a.:
          </div>
          {[
            {label:'Daily interest',   val:perDay,               note:'rate ÷ 365'},
            {label:'Monthly payout',   val:perMonth,             note:'rate ÷ 12'},
            {label:'Quarterly payout', val:cap*rateDecimal/4,    note:'rate ÷ 4'},
            {label:'Annual total',     val:cap*rateDecimal,      note:'gross, before tax'},
            {label:'After tax (26.375%)', val:cap*rateDecimal*0.73625, note:'Abgeltungssteuer DE'},
          ].map(row=>(
            <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:12,color:'var(--text-2)'}}>{row.label}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{row.note}</div>
              </div>
              <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:500,color:'var(--green)'}}>{formatEUR(row.val)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function TradingPage() {
  const { trades, addEntry, removeEntry, loading } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [tab, setTab]   = useState('journal');

  const addTrade = async () => {
    if (!form.symbol||!form.pnl) return;
    await addEntry('trade', { ...form, pnl:parseFloat(form.pnl) });
    setForm(EMPTY);
  };

  const totalPnL = trades.reduce((s,t)=>s+Number(t.pnl||0),0);
  const wins     = trades.filter(t=>Number(t.pnl)>=0).length;
  const losses   = trades.filter(t=>Number(t.pnl)<0).length;
  const winRate  = trades.length>0?((wins/trades.length)*100).toFixed(1):0;
  const avgWin   = wins>0?trades.filter(t=>Number(t.pnl)>=0).reduce((s,t)=>s+Number(t.pnl),0)/wins:0;
  const avgLoss  = losses>0?Math.abs(trades.filter(t=>Number(t.pnl)<0).reduce((s,t)=>s+Number(t.pnl),0)/losses):0;
  const rr       = avgLoss>0?(avgWin/avgLoss).toFixed(2):'—';

  const equityCurve = useMemo(()=>{
    let cum=0;
    return [...trades].sort((a,b)=>new Date(a.date)-new Date(b.date)).map((t,i)=>{
      cum+=Number(t.pnl||0);
      return {name:`T${i+1}`,pnl:Number(t.pnl||0),equity:parseFloat(cum.toFixed(2))};
    });
  },[trades]);

  const monthlyPnL = useMemo(()=>{
    const map={};
    trades.forEach(t=>{ if(!t.date) return; const k=t.date.substring(0,7); map[k]=(map[k]||0)+Number(t.pnl||0); });
    return Object.entries(map).sort().map(([k,v])=>({ label:new Date(k+'-01').toLocaleDateString('en-GB',{month:'short',year:'2-digit'}), pnl:parseFloat(v.toFixed(2)) }));
  },[trades]);

  const weeklyPnL = useMemo(()=>{
    const map={};
    trades.forEach(t=>{ if(!t.date) return; const w=`W${String(getWeek(t.date)).padStart(2,'0')}`; map[w]=(map[w]||0)+Number(t.pnl||0); });
    return Object.entries(map).sort().map(([k,v])=>({label:k,pnl:parseFloat(v.toFixed(2))}));
  },[trades]);

  const TABS=[['journal','Journal'],['calendar','Calendar'],['weekly','Weekly'],['charts','Charts'],['interest','Interest Calc']];

  if (loading) return <div style={{color:'var(--text-3)',padding:40,fontSize:13}}>Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
        <div className="label" style={{marginBottom:4}}>Performance</div>
        <h1>Trading P&L</h1>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10,marginBottom:20}}>
        {[
          {label:'Total P&L',val:formatEUR(totalPnL),color:totalPnL>=0?'var(--green)':'var(--red)'},
          {label:'Win Rate', val:`${winRate}%`,      color:'var(--accent)'},
          {label:'W / L',    val:`${wins} / ${losses}`,color:'var(--text)'},
          {label:'Avg Win',  val:formatEUR(avgWin),  color:'var(--green)'},
          {label:'R:R',      val:rr,                 color:'var(--amber)'},
        ].map(s=>(
          <div key={s.label} className="card" style={{padding:'12px 14px',borderTop:`2px solid ${s.color}`,borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
            <div className="label" style={{marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:17,fontWeight:500,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:0,marginBottom:18,borderBottom:'1px solid var(--border)'}}>
        {TABS.map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 16px',background:'transparent',color:tab===id?'var(--text)':'var(--text-3)',fontWeight:tab===id?500:400,fontSize:12,border:'none',borderBottom:tab===id?'2px solid var(--accent)':'2px solid transparent',marginBottom:'-1px',letterSpacing:'0.03em',whiteSpace:'nowrap'}}>{label}</button>
        ))}
      </div>

      {tab==='journal'&&(
        <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:14}}>
          <div className="card" style={{height:'fit-content'}}>
            <div className="label" style={{marginBottom:14}}>Log Trade</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div><div className="label" style={{marginBottom:4}}>Date</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                <div><div className="label" style={{marginBottom:4}}>Symbol</div><input type="text" value={form.symbol} onChange={e=>setForm({...form,symbol:e.target.value.toUpperCase()})} placeholder="AAPL"/></div>
              </div>
              <div>
                <div className="label" style={{marginBottom:4}}>Setup</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                  {SETUPS.map(s=>(
                    <button key={s} onClick={()=>setForm({...form,setup:s})} style={{padding:'4px 10px',borderRadius:'var(--radius)',fontSize:11,background:form.setup===s?'var(--accent-dim)':'var(--bg-3)',color:form.setup===s?'var(--accent)':'var(--text-3)',border:`1px solid ${form.setup===s?'rgba(74,124,247,0.3)':'var(--border)'}`}}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                <div><div className="label" style={{marginBottom:4}}>Entry</div><input type="number" value={form.entry} onChange={e=>setForm({...form,entry:e.target.value})} placeholder="0.00" step="0.01"/></div>
                <div><div className="label" style={{marginBottom:4}}>Exit</div><input type="number" value={form.exit} onChange={e=>setForm({...form,exit:e.target.value})} placeholder="0.00" step="0.01"/></div>
              </div>
              <div><div className="label" style={{marginBottom:4}}>P&L (€) *</div><input type="number" value={form.pnl} onChange={e=>setForm({...form,pnl:e.target.value})} placeholder="+150 or -80" step="0.01"/></div>
              <div><div className="label" style={{marginBottom:4}}>Notes</div><input type="text" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="optional"/></div>
              <button className="btn" onClick={addTrade}>Log Trade</button>
            </div>
          </div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div className="label">Journal</div>
              <span style={{fontSize:11,color:'var(--text-3)'}}>{trades.length} trades</span>
            </div>
            {trades.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No trades logged yet</div>:(
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                <div style={{display:'grid',gridTemplateColumns:'80px 90px 70px 80px 1fr 44px',gap:8,padding:'4px 8px'}}>
                  {['Date','Symbol','Setup','P&L','Notes',''].map(h=><div key={h} className="label">{h}</div>)}
                </div>
                {trades.map(t=>(
                  <div key={t.id} style={{display:'grid',gridTemplateColumns:'80px 90px 70px 80px 1fr 44px',gap:8,padding:'8px',background:'var(--bg-3)',borderRadius:'var(--radius)',borderLeft:`2px solid ${Number(t.pnl)>=0?'var(--green)':'var(--red)'}`,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--text-3)'}}>{formatDate(t.date)}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:500}}>{t.symbol}</span>
                    <span className={`tag tag-${t.setup==='Long'?'green':t.setup==='Short'?'red':'accent'}`} style={{fontSize:9,width:'fit-content'}}>{t.setup}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:500,color:Number(t.pnl)>=0?'var(--green)':'var(--red)'}}>{Number(t.pnl)>=0?'+':''}{formatEUR(t.pnl)}</span>
                    <span style={{fontSize:11,color:'var(--text-3)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.notes||'—'}</span>
                    <button className="btn-danger" onClick={()=>removeEntry('trade',t.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab==='calendar'&&(
        <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:14}}>
          <div className="card"><PnLCalendar trades={trades}/></div>
          <div className="card">
            <div className="label" style={{marginBottom:14}}>Monthly P&L</div>
            {monthlyPnL.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No trades yet</div>:(
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthlyPnL} margin={{top:10,right:0,bottom:0,left:-10}}>
                  <XAxis dataKey="label" stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                  <Tooltip content={<CT/>}/>
                  <ReferenceLine y={0} stroke="var(--border-2)"/>
                  <Bar dataKey="pnl" radius={[3,3,0,0]}>{monthlyPnL.map((e,i)=><Cell key={i} fill={e.pnl>=0?'var(--green)':'var(--red)'}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab==='weekly'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="card"><div className="label" style={{marginBottom:14}}>P&L by Week</div><WeeklyTable trades={trades}/></div>
          <div className="card">
            <div className="label" style={{marginBottom:14}}>Weekly P&L Chart</div>
            {weeklyPnL.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No data</div>:(
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={weeklyPnL} margin={{top:10,right:0,bottom:0,left:-10}}>
                  <XAxis dataKey="label" stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                  <Tooltip content={<CT/>}/>
                  <ReferenceLine y={0} stroke="var(--border-2)"/>
                  <Bar dataKey="pnl" radius={[3,3,0,0]}>{weeklyPnL.map((e,i)=><Cell key={i} fill={e.pnl>=0?'var(--green)':'var(--red)'}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab==='charts'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div className="card">
            <div className="label" style={{marginBottom:14}}>Equity Curve</div>
            {equityCurve.length<2?<div style={{color:'var(--text-3)',fontSize:12}}>Min. 2 trades needed</div>:(
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={equityCurve} margin={{top:5,right:5,bottom:0,left:-10}}>
                  <XAxis dataKey="name" stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                  <Tooltip content={<CT/>}/>
                  <ReferenceLine y={0} stroke="var(--border-2)"/>
                  <Line type="monotone" dataKey="equity" stroke="var(--accent)" strokeWidth={1.5} dot={false} name="Equity"/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="card">
            <div className="label" style={{marginBottom:14}}>P&L per Trade</div>
            {equityCurve.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No trades yet</div>:(
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={equityCurve} margin={{top:5,right:5,bottom:0,left:-10}}>
                  <XAxis dataKey="name" stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                  <YAxis stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                  <Tooltip content={<CT/>}/>
                  <ReferenceLine y={0} stroke="var(--border-2)"/>
                  <Bar dataKey="pnl" radius={[3,3,0,0]}>{equityCurve.map((e,i)=><Cell key={i} fill={e.pnl>=0?'var(--green)':'var(--red)'}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {tab==='interest'&&<InterestTab trades={trades}/>}
    </div>
  );
}
