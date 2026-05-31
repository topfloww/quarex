import React, { useState, useRef } from 'react';
import { useStore } from '../utils/DataContext';
import { formatEUR, formatDate, today, parseEntry } from '../utils/storage';

const DAYS = Array.from({length:28},(_,i)=>i+1);

export default function BudgetPage() {
  const { income, expenses, recurring, addEntry, removeEntry, loading } = useStore();
  const [tab, setTab]       = useState('quick');
  const [quickText, setQt]  = useState('');
  const [quickDate, setQd]  = useState(today());
  const [parsed, setParsed] = useState(null);
  const [recForm, setRF]    = useState({ desc:'', amount:'', type:'income', day:1 });
  const inputRef = useRef();

  const handleQt = (val) => {
    setQt(val);
    if (val.trim().length>2) setParsed(parseEntry(val)); else setParsed(null);
  };

  const commit = async () => {
    if (!parsed?.amount) return;
    await addEntry(parsed.type, { date:quickDate, desc:parsed.desc, amount:parsed.amount });
    setQt(''); setParsed(null); inputRef.current?.focus();
  };

  const addRec = async () => {
    if (!recForm.desc||!recForm.amount) return;
    await addEntry('recurring', { ...recForm, amount:parseFloat(recForm.amount) });
    setRF({ desc:'', amount:'', type:'income', day:1 });
  };

  const totalExp = expenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const totalInc = income.reduce((s,i)=>s+Number(i.amount||0),0);
  const net = totalInc - totalExp;

  if (loading) return <div style={{color:'var(--text-3)',padding:40,fontSize:13}}>Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
        <div className="label" style={{marginBottom:4}}>Finance</div>
        <h1>Budget</h1>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[{label:'Income',val:totalInc,color:'var(--green)'},{label:'Expenses',val:totalExp,color:'var(--red)'},{label:'Net',val:net,color:net>=0?'var(--accent)':'var(--red)'}].map(s=>(
          <div key={s.label} className="card" style={{borderTop:`2px solid ${s.color}`,borderRadius:'0 0 var(--radius-lg) var(--radius-lg)'}}>
            <div className="label" style={{marginBottom:7}}>{s.label}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:22,fontWeight:500,color:s.color}}>{formatEUR(s.val)}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:0,marginBottom:18,borderBottom:'1px solid var(--border)'}}>
        {[['quick','Quick Entry'],['history','History'],['recurring','Recurring']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 18px',background:'transparent',color:tab===id?'var(--text)':'var(--text-3)',fontWeight:tab===id?500:400,fontSize:12,border:'none',borderBottom:tab===id?'2px solid var(--accent)':'2px solid transparent',marginBottom:'-1px',letterSpacing:'0.03em'}}>{label}</button>
        ))}
      </div>

      {tab==='quick'&&(
        <div style={{maxWidth:580}}>
          <div className="card">
            <div className="label" style={{marginBottom:10}}>Quick Entry</div>
            <div style={{fontSize:12,color:'var(--text-3)',marginBottom:14,lineHeight:1.7}}>
              Just type what you spent or earned — Quarex recognises it automatically.<br/>
              <span style={{color:'var(--text-2)'}}>e.g. "fuel 45" · "pocket money 150" · "salary 800" · "groceries 32"</span>
            </div>
            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input ref={inputRef} type="text" value={quickText} onChange={e=>handleQt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&commit()} placeholder="What did you spend or receive?" style={{flex:1,fontSize:14}} autoFocus/>
              <input type="date" value={quickDate} onChange={e=>setQd(e.target.value)} style={{width:140}}/>
            </div>
            {parsed?.amount?(
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'var(--bg-3)',borderRadius:'var(--radius)',border:`1px solid ${parsed.type==='income'?'rgba(45,212,160,0.3)':'rgba(240,82,82,0.3)'}`,marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:6,height:6,borderRadius:'50%',background:parsed.type==='income'?'var(--green)':'var(--red)'}}/>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{parsed.desc}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'0.04em'}}>{parsed.type==='income'?'Income':'Expense'} · {quickDate}</div>
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontFamily:'var(--mono)',fontSize:14,fontWeight:500,color:parsed.type==='income'?'var(--green)':'var(--red)'}}>{parsed.type==='income'?'+':'-'}{formatEUR(parsed.amount)}</span>
                  <button onClick={()=>setParsed({...parsed,type:parsed.type==='income'?'expense':'income'})} className="btn-ghost" style={{fontSize:10,padding:'3px 8px'}}>⇄ {parsed.type==='income'?'as Expense':'as Income'}</button>
                </div>
              </div>
            ):quickText.length>2?<div style={{padding:'8px 12px',background:'var(--bg-3)',borderRadius:'var(--radius)',fontSize:12,color:'var(--text-3)',marginBottom:10}}>Amount not recognised — e.g. "fuel 45"</div>:null}
            <button className="btn" onClick={commit} style={{opacity:parsed?.amount?1:0.4}}>Book Entry (Enter)</button>
          </div>
        </div>
      )}

      {tab==='history'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          {[{title:'Expenses',list:expenses,type:'expense',color:'var(--red)',sign:'-'},{title:'Income',list:income,type:'income',color:'var(--green)',sign:'+'}].map(({title,list,type,color,sign})=>(
            <div key={title} className="card">
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                <div className="label">{title}</div>
                <span style={{fontSize:11,color:'var(--text-3)'}}>{list.length}</span>
              </div>
              {list.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No {title.toLowerCase()} yet</div>:(
                <div style={{display:'flex',flexDirection:'column',gap:3}}>
                  {list.map(e=>(
                    <div key={e.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 8px',background:'var(--bg-3)',borderRadius:'var(--radius)'}}>
                      <div>
                        <span style={{fontSize:12,fontWeight:500}}>{e.desc}</span>
                        {e.auto&&<span className="tag tag-accent" style={{marginLeft:6,fontSize:9}}>auto</span>}
                        <div style={{fontSize:10,color:'var(--text-3)'}}>{formatDate(e.date)}</div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span style={{fontFamily:'var(--mono)',fontSize:12,color}}>{sign}{formatEUR(e.amount)}</span>
                        <button className="btn-danger" onClick={()=>removeEntry(type,e.id)}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab==='recurring'&&(
        <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:14}}>
          <div className="card" style={{height:'fit-content'}}>
            <div className="label" style={{marginBottom:12}}>New Rule</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <div><div className="label" style={{marginBottom:4}}>Name</div>
                <input type="text" value={recForm.desc} onChange={e=>setRF({...recForm,desc:e.target.value})} placeholder="e.g. Pocket Money"/></div>
              <div><div className="label" style={{marginBottom:4}}>Amount (€)</div>
                <input type="number" value={recForm.amount} onChange={e=>setRF({...recForm,amount:e.target.value})} placeholder="150" step="0.01"/></div>
              <div style={{display:'flex',gap:6}}>
                {['income','expense'].map(t=>(
                  <button key={t} onClick={()=>setRF({...recForm,type:t})} style={{flex:1,padding:'6px',borderRadius:'var(--radius)',fontSize:11,background:recForm.type===t?(t==='income'?'var(--green-dim)':'var(--red-dim)'):'var(--bg-3)',color:recForm.type===t?(t==='income'?'var(--green)':'var(--red)'):'var(--text-3)',border:`1px solid ${recForm.type===t?(t==='income'?'rgba(45,212,160,0.3)':'rgba(240,82,82,0.3)'):'var(--border)'}`}}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>
              <div><div className="label" style={{marginBottom:4}}>Day of month</div>
                <select value={recForm.day} onChange={e=>setRF({...recForm,day:parseInt(e.target.value)})}>
                  {DAYS.map(d=><option key={d} value={d}>{d}. of each month</option>)}
                </select></div>
              <button className="btn" onClick={addRec}>Add Rule</button>
            </div>
          </div>
          <div className="card">
            <div className="label" style={{marginBottom:10}}>Active Rules</div>
            <div style={{fontSize:12,color:'var(--text-3)',marginBottom:14}}>These entries are booked automatically once the scheduled day arrives each month.</div>
            {recurring.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No rules yet</div>:(
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {recurring.map(r=>(
                  <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'var(--bg-3)',borderRadius:'var(--radius)',borderLeft:`2px solid ${r.type==='income'?'var(--green)':'var(--red)'}`}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:500}}>{r.desc}</div>
                      <div style={{fontSize:10,color:'var(--text-3)',marginTop:1}}>Every {r.day}. · {r.type==='income'?'Income':'Expense'}</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <span style={{fontFamily:'var(--mono)',fontSize:13,fontWeight:500,color:r.type==='income'?'var(--green)':'var(--red)'}}>{r.type==='income'?'+':'-'}{formatEUR(r.amount)}</span>
                      <button className="btn-danger" onClick={()=>removeEntry('recurring',r.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
