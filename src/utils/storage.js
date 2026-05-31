// ── localStorage fallback ─────────────────────────────────────
const ls = {
  get: (k, fb=[]) => { try { const v=localStorage.getItem(k); return v?JSON.parse(v):fb; } catch { return fb; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export const storage = {
  getExpenses:   () => ls.get('fd_expenses'),
  saveExpenses:  (d) => ls.set('fd_expenses', d),
  getIncome:     () => ls.get('fd_income'),
  saveIncome:    (d) => ls.set('fd_income', d),
  getDriving:    () => ls.get('fd_driving'),
  saveDriving:   (d) => ls.set('fd_driving', d),
  getTrades:     () => ls.get('fd_trades'),
  saveTrades:    (d) => ls.set('fd_trades', d),
  getSavings:    () => ls.get('fd_savings', { amount:0 }),
  saveSavings:   (d) => ls.set('fd_savings', d),
  getRecurring:  () => ls.get('fd_recurring'),
  saveRecurring: (d) => ls.set('fd_recurring', d),
};

// ── Formatters ────────────────────────────────────────────────
export const formatEUR = (n) =>
  new Intl.NumberFormat('de-DE', { style:'currency', currency:'EUR' }).format(n??0);

export const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' });
};

export const today = () => new Date().toISOString().split('T')[0];

// ── Smart text parser ─────────────────────────────────────────
export const parseEntry = (text) => {
  const lower = text.toLowerCase().trim();
  const m = text.match(/\d+([.,]\d{1,2})?/);
  const amount = m ? parseFloat(m[0].replace(',','.')) : null;
  const raw = text.replace(/\d+([.,]\d{1,2})?/,'').replace(/[€$]/,'').trim();
  const desc = raw ? raw.charAt(0).toUpperCase()+raw.slice(1).toLowerCase() : 'Entry';
  const incWords = ['salary','wage','income','pocket','allowance','refund','bonus','freelance','earned','received','payment received','taschengeld','gehalt','einnahme'];
  const isIncome = incWords.some(w=>lower.includes(w));
  return { amount, desc, type: isIncome?'income':'expense' };
};

// ── Recurring auto-apply (only when day has been reached) ─────
export const applyRecurring = (recurringList, incomeList, expenseList) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth()+1;
  const monthKey = `${year}-${String(month).padStart(2,'0')}`;
  const todayDay = now.getDate();

  let newIncome   = [...incomeList];
  let newExpenses = [...expenseList];
  let changed = false;

  recurringList.forEach(r => {
    if (todayDay < r.day) return; // not yet
    const alreadyApplied = [...incomeList,...expenseList].some(
      e => e.recurringId===r.id && e.date?.startsWith(monthKey)
    );
    if (!alreadyApplied) {
      const day = String(r.day).padStart(2,'0');
      const date = `${monthKey}-${day}`;
      const entry = { id:Date.now()+Math.random(), recurringId:r.id, date, desc:r.desc, amount:r.amount, auto:true };
      if (r.type==='income') newIncome=[entry,...newIncome];
      else newExpenses=[entry,...newExpenses];
      changed=true;
    }
  });

  return { newIncome, newExpenses, changed };
};
