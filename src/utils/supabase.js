const BASE = 'https://oyadvsxiedejjlpiphlt.supabase.co/rest/v1';
const KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95YWR2c3hpZWRlampscGlwaGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNjE4NTksImV4cCI6MjA5NTczNzg1OX0.5xLiXk0dPmZBnHL1RoupOZJv7Hyt3XYMQmZ4zKDpmV8';

const h = (extra = {}) => ({
  'apikey':        KEY,
  'Authorization': `Bearer ${KEY}`,
  'Content-Type':  'application/json',
  ...extra,
});

export const db = {
  async getAll(table) {
    try {
      const r = await fetch(`${BASE}/${table}?order=created_at.desc`, { headers: h() });
      if (!r.ok) { console.error('Supabase getAll:', await r.text()); return null; }
      return await r.json();
    } catch(e) { console.error('Supabase getAll error:', e); return null; }
  },

  async insert(table, row) {
    try {
      const r = await fetch(`${BASE}/${table}`, {
        method: 'POST',
        headers: h({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(row),
      });
      if (!r.ok) { console.error('Supabase insert:', await r.text()); return null; }
      const res = await r.json();
      return Array.isArray(res) ? res[0] : res;
    } catch(e) { console.error('Supabase insert error:', e); return null; }
  },

  async update(table, id, changes) {
    try {
      const r = await fetch(`${BASE}/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: h({ 'Prefer': 'return=representation' }),
        body: JSON.stringify(changes),
      });
      if (!r.ok) console.error('Supabase update:', await r.text());
      return r.ok;
    } catch(e) { console.error('Supabase update error:', e); return false; }
  },

  async remove(table, id) {
    try {
      const r = await fetch(`${BASE}/${table}?id=eq.${id}`, {
        method: 'DELETE',
        headers: h(),
      });
      if (!r.ok) console.error('Supabase delete:', await r.text());
      return r.ok;
    } catch(e) { console.error('Supabase delete error:', e); return false; }
  },

  async upsertSetting(key, value) {
    try {
      const r = await fetch(`${BASE}/settings`, {
        method: 'POST',
        headers: h({ 'Prefer': 'resolution=merge-duplicates,return=representation' }),
        body: JSON.stringify({ key, value: String(value) }),
      });
      if (!r.ok) console.error('Supabase upsert:', await r.text());
      return r.ok;
    } catch(e) { console.error('Supabase upsert error:', e); return false; }
  },

  async getSetting(key) {
    try {
      const r = await fetch(`${BASE}/settings?key=eq.${key}`, { headers: h() });
      if (!r.ok) return null;
      const rows = await r.json();
      return rows[0]?.value ?? null;
    } catch { return null; }
  },
};

// Map our internal object fields to DB column names
export const toRow = (type, obj) => {
  const row = {
    type,
    created_at:  new Date().toISOString(),
    date:        obj.date,
    amount:      obj.amount,
    cost:        obj.cost,
    pnl:         obj.pnl,
    description: obj.desc,        // desc → description
    category:    obj.category,
    symbol:      obj.symbol,
    setup:       obj.setup,
    notes:       obj.notes,
    entry:       obj.entry,
    exit_price:  obj.exit,        // exit → exit_price
    completed:   obj.completed,
    recurring_id:obj.recurringId,
    auto:        obj.auto,
    day:         obj.day,
  };
  // Remove undefined keys to keep payload clean
  Object.keys(row).forEach(k => row[k] === undefined && delete row[k]);
  return row;
};

// Map DB row back to internal object format
export const fromRow = (row) => ({
  ...row,
  desc:       row.description,
  exit:       row.exit_price,
  recurringId:row.recurring_id,
});

export const ofType = (rows, type) => rows.filter(r => r.type === type).map(fromRow);
