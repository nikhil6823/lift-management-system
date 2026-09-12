import { useState } from 'react';
import { LIFT_STATUSES } from '../../utils/constants';

const blank = { code: '', name: '', building: '', address: '', make: '', model: '', capacityKg: '', floors: '', status: 'operational', nextServiceDate: '', warrantyUntil: '', assignedCustomer: '', latitude: '', longitude: '' };
export function LiftForm({ initial, customers = [], onSave, onCancel }) {
  const [form, setForm] = useState(initial ? { ...blank, ...initial, latitude: initial.location?.latitude ?? '', longitude: initial.location?.longitude ?? '', nextServiceDate: initial.nextServiceDate?.slice(0, 10) || '', warrantyUntil: initial.warrantyUntil?.slice(0, 10) || '' } : blank);
  const [saving, setSaving] = useState(false);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { const { latitude, longitude, ...data } = form; await onSave({ ...data, capacityKg: form.capacityKg || undefined, floors: form.floors || undefined, assignedCustomer: form.assignedCustomer?._id || form.assignedCustomer || null, location: latitude !== '' && longitude !== '' ? { latitude: Number(latitude), longitude: Number(longitude) } : undefined }); } finally { setSaving(false); } };
  return <form className="form-grid" onSubmit={submit}>
    <label>Lift code<input required name="code" value={form.code} onChange={change} placeholder="LFT-001" /></label><label>Name<input required name="name" value={form.name} onChange={change} placeholder="Main passenger lift" /></label>
    <label>Building<input required name="building" value={form.building} onChange={change} /></label><label>Address<input name="address" value={form.address} onChange={change} /></label>
    <label>Make<input name="make" value={form.make} onChange={change} /></label><label>Model<input name="model" value={form.model} onChange={change} /></label>
    <label>Capacity (kg)<input type="number" min="0" name="capacityKg" value={form.capacityKg} onChange={change} /></label><label>Floors served<input type="number" min="1" name="floors" value={form.floors} onChange={change} /></label>
    <label>Status<select name="status" value={form.status} onChange={change}>{LIFT_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label><label>Next service<input type="date" name="nextServiceDate" value={form.nextServiceDate} onChange={change} /></label><label>Warranty until<input type="date" name="warrantyUntil" value={form.warrantyUntil} onChange={change} /></label>
    <label>Latitude<input type="number" step="any" min="-90" max="90" name="latitude" value={form.latitude} onChange={change} placeholder="19.1197" /></label><label>Longitude<input type="number" step="any" min="-180" max="180" name="longitude" value={form.longitude} onChange={change} placeholder="72.8468" /></label>
    <label className="full">Customer portal access<select name="assignedCustomer" value={form.assignedCustomer?._id || form.assignedCustomer || ''} onChange={change}><option value="">No customer assigned</option>{customers.map((customer) => <option value={customer._id} key={customer._id}>{customer.name} · {customer.email}</option>)}</select></label>
    <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button disabled={saving}>{saving ? 'Saving…' : 'Save lift'}</button></div>
  </form>;
}
