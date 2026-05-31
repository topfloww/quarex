import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, ReferenceLine } from 'recharts';
import { useStore } from '../utils/DataContext';
import { formatEUR } from '../utils/storage';

const SCALES = [
  {label:'1D',days:1},{label:'3D',days:3},{label:'1W',days:7},
  {label:'1M',days:30},{label:'6M',days:182},{label:'1Y',days:365},{label:'All',days:null},
];

const CT = ({active,payload,label}) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'var(--bg-4)',border:'1px solid var(--border-2)',borderRadius:4,padding:'8px 12px',fontSize:12}}>
      <div style={{color:'var(--text-2)',marginBottom:4,fontSize:10,textTransform:'uppercase',letterSpacing:'0.04em'}}>{label}</div>
      {payload.map(p=><div key={p.dataKey} style={{color:p.color||'var(--text)',fontFamily:'var(--mono)'}}>{p.name}: {formatEUR(p.value)}</div>)}
    </div>
  );
};

function Metric({label,value,color,sub}) {
  return (
    <div className="card" style={{borderTop:`2px solid ${color||'var(--border-3)'}`,borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
      <div className="label" style={{marginBottom:7}}>{label}</div>
      <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:500,color:color||'var(--text)'}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:'var(--text-3)',marginTop:5}}>{sub}</div>}
    </div>
  );
}

export default function Overview() {
  const { income, expenses, driving, trades, savings, loading, updateSavings } = useStore();
  const [savingsInput, setSavingsInput] = useState(String(savings?.amount||''));
  const [scale, setScale] = useState('6M');

  const totalExp     = expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const totalInc     = income.reduce((s,i)=>s+Number(i.amount||0),0);
  const totalDriving = driving.reduce((s,d)=>s+Number(d.cost||0),0);
  const paidDriving  = driving.filter(d=>d.completed).reduce((s,d)=>s+Number(d.cost||0),0);
  const unpaidDriving= totalDriving - paidDriving;
  const tradePnL     = trades.reduce((s,t)=>s+Number(t.pnl||0),0);
  const balance      = totalInc - totalExp + tradePnL;
  const savingsAmt   = Number(savings?.amount||0);
  const totalWealth  = balance + savingsAmt;

  const cashflowData = useMemo(()=>{
    const scaleObj = SCALES.find(s=>s.label===scale);
    const cutoff = scaleObj?.days ? new Date(Date.now()-scaleObj.days*86400000) : null;
    const allDates = [...new Set([...income.map(x=>x.date),...expenses.map(x=>x.date)].filter(Boolean))].filter(d=>!cutoff||new Date(d)>=cutoff).sort();
    return allDates.map(d=>({
      label:new Date(d).toLocaleDateString('en-GB',{day:'2-digit',month:'short'}),
      Income:income.filter(x=>x.date===d).reduce((s,x)=>s+Number(x.amount||0),0),
      Expenses:expenses.filter(x=>x.date===d).reduce((s,x)=>s+Number(x.amount||0),0),
    }));
  },[income,expenses,scale]);

  const wealthCurve = useMemo(()=>{
    const all=[...income.map(x=>({date:x.date,v:+Number(x.amount||0)})),...expenses.map(x=>({date:x.date,v:-Number(x.amount||0)})),...trades.map(x=>({date:x.date,v:+Number(x.pnl||0)}))].filter(x=>x.date).sort((a,b)=>new Date(a.date)-new Date(b.date));
    let cum=savingsAmt;
    return all.map((x,i)=>{ cum+=x.v; return {i:i+1,Wealth:parseFloat(cum.toFixed(2))}; });
  },[income,expenses,trades,savingsAmt]);

  const monthlyNet = useMemo(()=>{
    const map={};
    [...income.map(x=>({date:x.date,v:+Number(x.amount||0)})),...expenses.map(x=>({date:x.date,v:-Number(x.amount||0)})),...trades.map(x=>({date:x.date,v:+Number(x.pnl||0)}))].forEach(x=>{
      if(!x.date) return; const k=x.date.substring(0,7); map[k]=(map[k]||0)+x.v;
    });
    return Object.entries(map).sort().map(([k,v])=>({label:new Date(k+'-01').toLocaleDateString('en-GB',{month:'short',year:'2-digit'}),Net:parseFloat(v.toFixed(2))}));
  },[income,expenses,trades]);

  const recent=[...expenses.map(e=>({...e,_t:'Expense',_a:-e.amount})),...income.map(i=>({...i,_t:'Income',_a:+i.amount})),...trades.map(t=>({...t,_t:'Trade',_a:+t.pnl,desc:t.symbol}))].filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6);

  if (loading) return <div style={{color:'var(--text-3)',padding:40,fontSize:13}}>Loading data...</div>;

  return (
    <div>
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
        <div className="label" style={{marginBottom:4}}>Quarex</div>
        <h1>Overview</h1>
      </div>

      {unpaidDriving>0&&(
        <div style={{marginBottom:16,padding:'12px 18px',background:'var(--red-dim)',border:'1px solid rgba(240,82,82,0.3)',borderRadius:'var(--radius-lg)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:'var(--red)'}}>⚠ Open Driving School Costs</div>
            <div style={{fontSize:11,color:'rgba(240,82,82,0.6)',marginTop:2}}>{driving.filter(d=>!d.completed).length} unpaid entries · deducted from Future Balance</div>
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:600,color:'var(--red)'}}>{formatEUR(unpaidDriving)}</div>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          <Metric label="Net Balance"    value={formatEUR(balance)}  color={balance>=0?'var(--green)':'var(--red)'} sub={`${income.length+expenses.length} transactions`}/>
          <Metric label="Trading P&L"    value={formatEUR(tradePnL)} color={tradePnL>=0?'var(--accent)':'var(--red)'} sub={`${trades.length} trades`}/>
          <Metric label="Total Income"   value={formatEUR(totalInc)} color="var(--green)" sub={`${income.length} entries`}/>
          <Metric label="Total Expenses" value={formatEUR(totalExp)} color="var(--red)" sub="excl. driving"/>
        </div>
        <div className="card">
          <div className="label" style={{marginBottom:12}}>Recent Activity</div>
          {recent.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No entries yet</div>:recent.map((item,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<recent.length-1?'1px solid var(--border)':'none'}}>
              <div>
                <div style={{fontSize:12,fontWeight:500}}>{item.desc||item._t}</div>
                <div style={{fontSize:10,color:'var(--text-3)',marginTop:1}}>{item._t.toUpperCase()} · {new Date(item.date).toLocaleDateString('en-GB')}</div>
              </div>
              <div style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500,color:item._a>=0?'var(--green)':'var(--red)'}}>{item._a>=0?'+':''}{formatEUR(item._a)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,flexWrap:'wrap',gap:10}}>
          <div><div className="label" style={{marginBottom:2}}>Cashflow</div><div style={{fontSize:11,color:'var(--text-3)'}}>Income vs. Expenses</div></div>
          <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
            {SCALES.map(s=>(
              <button key={s.label} onClick={()=>setScale(s.label)} style={{padding:'4px 9px',borderRadius:'var(--radius)',fontSize:11,background:scale===s.label?'var(--accent-dim)':'transparent',color:scale===s.label?'var(--accent)':'var(--text-3)',border:`1px solid ${scale===s.label?'rgba(74,124,247,0.3)':'var(--border)'}`}}>{s.label}</button>
            ))}
          </div>
        </div>
        {cashflowData.length>0?(
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={cashflowData} margin={{top:0,right:0,bottom:0,left:-20}}>
              <defs>
                <linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity={0.15}/><stop offset="100%" stopColor="var(--green)" stopOpacity={0}/></linearGradient>
                <linearGradient id="gE" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--red)" stopOpacity={0.15}/><stop offset="100%" stopColor="var(--red)" stopOpacity={0}/></linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd"/>
              <YAxis stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
              <Tooltip content={<CT/>}/>
              <Area type="monotone" dataKey="Income"   stroke="var(--green)" strokeWidth={1.5} fill="url(#gI)"/>
              <Area type="monotone" dataKey="Expenses" stroke="var(--red)"   strokeWidth={1.5} fill="url(#gE)"/>
            </AreaChart>
          </ResponsiveContainer>
        ):<div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text-3)',fontSize:12}}>No data for this period</div>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div className="card">
          <div className="label" style={{marginBottom:12}}>Total Wealth Over Time</div>
          {wealthCurve.length<2?<div style={{color:'var(--text-3)',fontSize:12,paddingTop:8}}>Add more transactions to see this chart</div>:(
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={wealthCurve} margin={{top:4,right:4,bottom:0,left:-10}}>
                <XAxis dataKey="i" stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                <YAxis stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                <Tooltip content={<CT/>}/>
                <ReferenceLine y={0} stroke="var(--border-2)"/>
                <Line type="monotone" dataKey="Wealth" stroke="var(--accent)" strokeWidth={1.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="label" style={{marginBottom:12}}>Monthly Net</div>
          {monthlyNet.length===0?<div style={{color:'var(--text-3)',fontSize:12,paddingTop:8}}>No data yet</div>:(
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={monthlyNet} margin={{top:4,right:4,bottom:0,left:-10}}>
                <XAxis dataKey="label" stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                <YAxis stroke="var(--text-3)" tick={{fontSize:10,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                <Tooltip content={<CT/>}/>
                <ReferenceLine y={0} stroke="var(--border-2)"/>
                <Bar dataKey="Net" radius={[3,3,0,0]}>{monthlyNet.map((e,i)=><Cell key={i} fill={e.Net>=0?'var(--green)':'var(--red)'}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
        <div className="card" style={{borderTop:'2px solid var(--accent)',borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
          <div className="label" style={{marginBottom:7}}>Savings</div>
          <input type="number" value={savingsInput} onChange={e=>setSavingsInput(e.target.value)} onBlur={e=>updateSavings(parseFloat(e.target.value)||0)} placeholder="0"
            style={{background:'transparent',border:'none',fontFamily:'var(--mono)',fontSize:22,fontWeight:500,color:'var(--accent)',padding:0,width:'100%'}}/>
          <div style={{fontSize:10,color:'var(--text-3)',marginTop:5}}>Not counted in balance</div>
        </div>
        <div className="card" style={{borderTop:'2px solid var(--text-2)',borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
          <div className="label" style={{marginBottom:7}}>Total Wealth</div>
          <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:500,color:'var(--text)'}}>{formatEUR(totalWealth)}</div>
          <div style={{fontSize:10,color:'var(--text-3)',marginTop:5}}>Balance + Savings</div>
        </div>
      </div>
    </div>
  );
}
