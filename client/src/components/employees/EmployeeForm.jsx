import { useState } from 'react';
const blank = { name: '', email: '', password: '', phone: '', employeeCode: '', designation: 'Technician', department: 'Field Service', baseSalary: '', skills: '' };
export function EmployeeForm({ onSave, onCancel }) {
  const [form, setForm] = useState(blank); const [saving, setSaving] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await onSave({ ...form, baseSalary: Number(form.baseSalary || 0), skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) }); } finally { setSaving(false); } };
  return <form className="form-grid" onSubmit={submit}>
    <label>Full name<input required name="name" value={form.name} onChange={change} /></label><label>Email<input required type="email" name="email" value={form.email} onChange={change} /></label>
    <label>Temporary password<input required minLength="8" type="password" name="password" value={form.password} onChange={change} /></label><label>Employee code<input required name="employeeCode" value={form.employeeCode} onChange={change} placeholder="EMP-001" /></label>
    <label>Phone<input name="phone" value={form.phone} onChange={change} /></label><label>Designation<input name="designation" value={form.designation} onChange={change} /></label>
    <label>Department<input name="department" value={form.department} onChange={change} /></label><label>Base monthly salary<input type="number" min="0" name="baseSalary" value={form.baseSalary} onChange={change} /></label>
    <label className="full">Skills (comma separated)<input name="skills" value={form.skills} onChange={change} placeholder="Hydraulics, safety inspection" /></label>
    <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button disabled={saving}>{saving ? 'Saving…' : 'Add employee'}</button></div>
  </form>;
}

