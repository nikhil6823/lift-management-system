import { useState } from 'react';
export function ExpenseForm({ onSave }) {
  const [form, setForm] = useState({ expenseDate: new Date().toISOString().slice(0, 10), category: 'travel', amount: '', description: '' }); const [saving, setSaving] = useState(false);
  const submit = async (e) => { e.preventDefault(); setSaving(true); try { await onSave({ ...form, amount: Number(form.amount) }); setForm({ ...form, amount: '', description: '' }); } finally { setSaving(false); } };
  return <form className="form-grid compact-form" onSubmit={submit}><label>Date<input type="date" value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} /></label><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{['travel', 'parts', 'tools', 'meals', 'other'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Amount<input required type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></label><label>Description<input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label><div className="form-actions"><button disabled={saving}>{saving ? 'Submitting…' : 'Submit expense'}</button></div></form>;
}

