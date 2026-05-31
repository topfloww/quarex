import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useStore } from '../utils/DataContext';
import { formatEUR, formatDate, today } from '../utils/storage';

const CATS = ['Lesson','Administration','Theory','Country Road','Night Drive','Highway'];
const REQUIRED = {'Country Road':5,'Highway':4,'Night Drive':3};
const COLORS = ['#4a7cf7','#2dd4a0','#e8a020','#f05252','#8b5cf6','#14b8a6'];
const EMPTY = { date:today(), category:'Lesson', cost:'', desc:'', completed:false };

function ProgressBar({label,done,required,color}) {
  const pct = Math.min((done/required)*100,100);
  const ok = done>=required;
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <span style={{fontSize:12,color:'var(--text-2)'}}>{label}</span>
        <span style={{fontFamily:'var(--mono)',fontSize:12,color:ok?'var(--green)':color,fontWeight:500}}>{done} / {required} {ok&&'✓'}</span>
      </div>
      <div style={{background:'var(--bg-5)',borderRadius:2,height:4}}>
        <div style={{height:'100%',width:`${pct}%`,background:ok?'var(--green)':color,borderRadius:2,transition:'width 0.4s'}}/>
      </div>
    </div>
  );
}

export default function DrivingPage() {
  const { driving, addEntry, removeEntry, patchEntry, loading } = useStore();
  const [form, setForm] = useState(EMPTY);
  const [budget, setBudget] = useState(() => localStorage.getItem('fd_driving_budget')||'');

  const save = async () => {
    if (!form.cost||isNaN(form.cost)) return;
    await addEntry('driving', { ...form, cost:parseFloat(form.cost) });
    setForm(EMPTY);
  };

  const total   = driving.reduce((s,e)=>s+Number(e.cost||0),0);
  const paid    = driving.filter(e=>e.completed).reduce((s,e)=>s+Number(e.cost||0),0);
  const unpaid  = total-paid;
  const budgetN = parseFloat(budget)||0;
  const progress= budgetN>0?Math.min((total/budgetN)*100,100):0;

  const counts = {};
  CATS.forEach(c=>{ counts[c]=driving.filter(e=>e.category===c).length; });
  const totalLessons = driving.filter(e=>['Lesson','Country Road','Night Drive','Highway'].includes(e.category)).length;

  const pieData = CATS.map((cat,i)=>({ name:cat, value:parseFloat(driving.filter(e=>e.category===cat).reduce((s,e)=>s+Number(e.cost||0),0).toFixed(2)), color:COLORS[i] })).filter(d=>d.value>0);

  const monthlyMap={};
  driving.forEach(e=>{ if(!e.date) return; const k=e.date.substring(0,7); monthlyMap[k]=(monthlyMap[k]||0)+Number(e.cost||0); });
  const monthlyData = Object.entries(monthlyMap).sort().map(([k,v])=>({ label:new Date(k+'-01').toLocaleDateString('en-GB',{month:'short'}), Costs:parseFloat(v.toFixed(2)) }));

  if (loading) return <div style={{color:'var(--text-3)',padding:40,fontSize:13}}>Loading...</div>;

  return (
    <div>
      <div style={{marginBottom:20,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
        <div className="label" style={{marginBottom:4}}>Cost Tracking</div>
        <h1>Driving School</h1>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:14}}>
        {[{label:'Total Costs',val:formatEUR(total),color:'var(--amber)'},{label:'Paid',val:formatEUR(paid),color:'var(--green)'},{label:'Outstanding',val:formatEUR(unpaid),color:unpaid>0?'var(--red)':'var(--text-3)'},{label:'Lessons',val:totalLessons,color:'var(--accent)'}].map(s=>(
          <div key={s.label} className="card" style={{borderTop:`2px solid ${s.color}`,borderRadius:'0 0 var(--radius-lg) var(--radius-lg)',padding:'14px 16px'}}>
            <div className="label" style={{marginBottom:6}}>{s.label}</div>
            <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:500,color:s.color}}>{s.val}</div>
          </div>
        ))}
      </div>

      {unpaid>0&&(
        <div style={{marginBottom:14,padding:'12px 18px',background:'var(--red-dim)',border:'1px solid rgba(240,82,82,0.3)',borderRadius:'var(--radius-lg)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <div style={{fontSize:13,fontWeight:500,color:'var(--red)'}}>⚠ Outstanding Payments</div>
            <div style={{fontSize:11,color:'rgba(240,82,82,0.6)',marginTop:2}}>{driving.filter(e=>!e.completed).length} entries not yet paid</div>
          </div>
          <div style={{fontFamily:'var(--mono)',fontSize:20,fontWeight:600,color:'var(--red)'}}>{formatEUR(unpaid)}</div>
        </div>
      )}

      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:budgetN>0?10:0}}>
          <div>
            <div className="label" style={{marginBottom:3}}>Budget</div>
            {budgetN>0&&<div style={{fontSize:11,color:(budgetN-total)>=0?'var(--green)':'var(--red)'}}>{(budgetN-total)>=0?`${formatEUR(budgetN-total)} remaining`:`${formatEUR(Math.abs(budgetN-total))} over budget`}</div>}
          </div>
          <input type="number" value={budget} onChange={e=>{setBudget(e.target.value);localStorage.setItem('fd_driving_budget',e.target.value);}} placeholder="Set budget in €" style={{width:150}}/>
        </div>
        {budgetN>0&&<div style={{background:'var(--bg-5)',borderRadius:2,height:4,overflow:'hidden',marginTop:10}}><div style={{height:'100%',width:`${progress}%`,background:progress>90?'var(--red)':progress>70?'var(--amber)':'var(--green)',transition:'width 0.4s'}}/></div>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'260px 1fr',gap:16}}>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="card">
            <div className="label" style={{marginBottom:12}}>New Entry</div>
            <div style={{display:'flex',flexDirection:'column',gap:9}}>
              <div><div className="label" style={{marginBottom:4}}>Date</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
              <div>
                <div className="label" style={{marginBottom:4}}>Category</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                  {CATS.map(c=>(
                    <button key={c} onClick={()=>setForm({...form,category:c})} style={{padding:'4px 9px',borderRadius:'var(--radius)',fontSize:11,background:form.category===c?'var(--accent-dim)':'var(--bg-3)',color:form.category===c?'var(--accent)':'var(--text-3)',border:`1px solid ${form.category===c?'rgba(74,124,247,0.3)':'var(--border)'}`}}>{c}</button>
                  ))}
                </div>
              </div>
              <div><div className="label" style={{marginBottom:4}}>Amount (€)</div><input type="number" value={form.cost} onChange={e=>setForm({...form,cost:e.target.value})} placeholder="45.00" step="0.01"/></div>
              <div><div className="label" style={{marginBottom:4}}>Note</div><input type="text" value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="optional"/></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" id="paid" checked={form.completed} onChange={e=>setForm({...form,completed:e.target.checked})} style={{width:'auto'}}/>
                <label htmlFor="paid" style={{fontSize:12,cursor:'pointer',color:'var(--text-2)'}}>Already paid</label>
              </div>
              <button className="btn" onClick={save}>Add Entry</button>
            </div>
          </div>

          <div className="card">
            <div className="label" style={{marginBottom:14}}>Required Drives</div>
            <ProgressBar label="Country Road" done={counts['Country Road']||0} required={5} color="var(--accent)"/>
            <ProgressBar label="Highway"      done={counts['Highway']||0}      required={4} color="var(--amber)"/>
            <ProgressBar label="Night Drive"  done={counts['Night Drive']||0}  required={3} color="var(--green)"/>
            <div style={{paddingTop:10,borderTop:'1px solid var(--border)',marginTop:4,display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:12,color:'var(--text-2)'}}>Total practice drives</span>
              <span style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:500}}>{totalLessons}</span>
            </div>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div className="card">
              <div className="label" style={{marginBottom:12}}>Costs by Category</div>
              {pieData.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No data yet</div>:(
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" stroke="none">
                      {pieData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Pie>
                    <Tooltip formatter={v=>formatEUR(v)}/>
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{fontSize:10}}/>
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="card">
              <div className="label" style={{marginBottom:12}}>Costs per Month</div>
              {monthlyData.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No data yet</div>:(
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={monthlyData} margin={{left:-20,right:0}}>
                    <XAxis dataKey="label" stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false}/>
                    <YAxis stroke="var(--text-3)" tick={{fontSize:11,fill:'var(--text-3)'}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}€`}/>
                    <Tooltip formatter={v=>formatEUR(v)}/>
                    <Bar dataKey="Costs" fill="var(--amber)" radius={[3,3,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div className="label">All Entries</div>
              <span style={{fontSize:11,color:'var(--text-3)'}}>{driving.length}</span>
            </div>
            {driving.length===0?<div style={{color:'var(--text-3)',fontSize:12}}>No entries yet</div>:(
              <div style={{display:'flex',flexDirection:'column',gap:3}}>
                <div style={{display:'grid',gridTemplateColumns:'80px 1fr 110px 70px 80px',gap:8,padding:'4px 8px'}}>
                  {['Date','Category / Note','Status','Amount',''].map(h=><div key={h} className="label">{h}</div>)}
                </div>
                {driving.map(e=>(
                  <div key={e.id} style={{display:'grid',gridTemplateColumns:'80px 1fr 110px 70px 80px',gap:8,padding:'8px',background:'var(--bg-3)',borderRadius:'var(--radius)',borderLeft:`2px solid ${e.completed?'var(--green)':'var(--red)'}`,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'var(--text-3)'}}>{formatDate(e.date)}</span>
                    <div><span style={{fontSize:12,fontWeight:500}}>{e.category}</span>{e.desc&&<div style={{fontSize:10,color:'var(--text-3)'}}>{e.desc}</div>}</div>
                    <span style={{fontSize:11,color:e.completed?'var(--green)':'var(--red)'}}>{e.completed?'✓ Paid':'Outstanding'}</span>
                    <span style={{fontFamily:'var(--mono)',fontSize:12,color:'var(--amber)',fontWeight:500}}>{formatEUR(e.cost)}</span>
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>patchEntry('driving',e.id,{completed:!e.completed})} className="btn-ghost" style={{padding:'3px 7px',fontSize:10}}>{e.completed?'↩':'✓'}</button>
                      <button className="btn-danger" onClick={()=>removeEntry('driving',e.id)}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
