import { useState, useEffect, useCallback } from 'react';
import { db, ofType, toRow } from './supabase';
import { storage, applyRecurring } from './storage';

export function useData() {
  const [income,     setIncome]    = useState([]);
  const [expenses,   setExpenses]  = useState([]);
  const [driving,    setDriving]   = useState([]);
  const [trades,     setTrades]    = useState([]);
  const [recurring,  setRecurring] = useState([]);
  const [savings,    setSavings]   = useState({ amount: 0 });
  const [online,     setOnline]    = useState(false);
  const [loading,    setLoading]   = useState(true);
  const [syncStatus, setSyncStatus]= useState('syncing');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setSyncStatus('syncing');

      const rows = await db.getAll('entries');

      if (rows) {
        setOnline(true);
        setSyncStatus('online');

        const inc = ofType(rows, 'income');
        const exp = ofType(rows, 'expense');
        const drv = ofType(rows, 'driving');
        const trd = ofType(rows, 'trade');
        const rec = ofType(rows, 'recurring');

        const { newIncome, newExpenses, changed } = applyRecurring(rec, inc, exp);
        if (changed) {
          const toAdd = [
            ...newIncome.filter(e => e.auto && !inc.find(i => i.id === e.id)),
            ...newExpenses.filter(e => e.auto && !exp.find(i => i.id === e.id)),
          ];
          for (const e of toAdd) {
            await db.insert('entries', toRow(e.recurringId ? 'income' : 'expense', e));
          }
        }

        const savVal = await db.getSetting('savings');
        if (savVal !== null) setSavings({ amount: parseFloat(savVal) || 0 });

        setIncome(newIncome);
        setExpenses(newExpenses);
        setDriving(drv);
        setTrades(trd);
        setRecurring(rec);
      } else {
        setOnline(false);
        setSyncStatus('offline');
        const rec = storage.getRecurring();
        const inc = storage.getIncome();
        const exp = storage.getExpenses();
        const { newIncome, newExpenses } = applyRecurring(rec, inc, exp);
        setIncome(newIncome);
        setExpenses(newExpenses);
        setDriving(storage.getDriving());
        setTrades(storage.getTrades());
        setRecurring(rec);
        setSavings(storage.getSavings());
      }
      setLoading(false);
    })();
  }, []);

  const addEntry = useCallback(async (type, obj) => {
    if (online) {
      const row = await db.insert('entries', toRow(type, obj));
      if (row) {
        if (type === 'income')    setIncome(p   => [row, ...p]);
        if (type === 'expense')   setExpenses(p => [row, ...p]);
        if (type === 'driving')   setDriving(p  => [row, ...p]);
        if (type === 'trade')     setTrades(p   => [row, ...p]);
        if (type === 'recurring') setRecurring(p=> [row, ...p]);
        return row;
      }
    }
    const entry = { ...obj, id: Date.now() };
    if (type === 'income')    { const u = [entry, ...income];    setIncome(u);    storage.saveIncome(u); }
    if (type === 'expense')   { const u = [entry, ...expenses];  setExpenses(u);  storage.saveExpenses(u); }
    if (type === 'driving')   { const u = [entry, ...driving];   setDriving(u);   storage.saveDriving(u); }
    if (type === 'trade')     { const u = [entry, ...trades];    setTrades(u);    storage.saveTrades(u); }
    if (type === 'recurring') { const u = [entry, ...recurring]; setRecurring(u); storage.saveRecurring(u); }
    return entry;
  }, [online, income, expenses, driving, trades, recurring]);

  const removeEntry = useCallback(async (type, id) => {
    if (online) await db.remove('entries', id);
    if (type === 'income')    { const u = income.filter(e=>e.id!==id);    setIncome(u);    storage.saveIncome(u); }
    if (type === 'expense')   { const u = expenses.filter(e=>e.id!==id);  setExpenses(u);  storage.saveExpenses(u); }
    if (type === 'driving')   { const u = driving.filter(e=>e.id!==id);   setDriving(u);   storage.saveDriving(u); }
    if (type === 'trade')     { const u = trades.filter(e=>e.id!==id);    setTrades(u);    storage.saveTrades(u); }
    if (type === 'recurring') { const u = recurring.filter(e=>e.id!==id); setRecurring(u); storage.saveRecurring(u); }
  }, [online, income, expenses, driving, trades, recurring]);

  const patchEntry = useCallback(async (type, id, changes) => {
    if (online) await db.update('entries', id, changes);
    const patch = arr => arr.map(e => e.id === id ? { ...e, ...changes } : e);
    if (type === 'driving') { const u = patch(driving); setDriving(u); storage.saveDriving(u); }
  }, [online, driving]);

  const updateSavings = useCallback(async (amount) => {
    setSavings({ amount });
    storage.saveSavings({ amount });
    if (online) await db.upsertSetting('savings', amount);
  }, [online]);

  return {
    income, expenses, driving, trades, recurring, savings,
    online, loading, syncStatus,
    addEntry, removeEntry, patchEntry, updateSavings,
  };
}
