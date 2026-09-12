import { BriefcaseBusiness, CalendarDays, Edit3, Mail, MapPin, Phone, Save, ShieldCheck, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/dateHelpers';

function Detail({ icon: Icon, label, value }) {
	return <div className="profile-detail"><Icon size={17} /><div><span>{label}</span><strong>{value || 'Not provided'}</strong></div></div>;
}

export default function Profile() {
	const { user, employee, updateProfile } = useAuth();
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [feedback, setFeedback] = useState({ type: '', message: '' });
	const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', emergencyContact: '' });

	useEffect(() => {
		setForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', address: employee?.address || '', emergencyContact: employee?.emergencyContact || '' });
	}, [user, employee]);

	function changeField(event) {
		setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
	}

	function cancelEditing() {
		setEditing(false);
		setFeedback({ type: '', message: '' });
	}

	async function saveProfile(event) {
		event.preventDefault();
		setSaving(true);
		setFeedback({ type: '', message: '' });
		try {
			await updateProfile(form);
			setEditing(false);
			setFeedback({ type: 'success', message: 'Profile details updated.' });
		} catch (error) {
			setFeedback({ type: 'error', message: error.response?.data?.message || error.message });
		} finally {
			setSaving(false);
		}
	}

	return <div className="profile-page">
		<div className="page-heading"><div><span className="eyebrow">Account</span><h1>My profile</h1><p>Keep your contact and work details close at hand.</p></div><div className="profile-header-actions">{editing ? <><button className="secondary" type="button" onClick={cancelEditing}><X size={16} />Cancel</button><button type="submit" form="profile-form" disabled={saving}><Save size={16} />{saving ? 'Saving...' : 'Save changes'}</button></> : <button type="button" onClick={() => { setFeedback({ type: '', message: '' }); setEditing(true); }}><Edit3 size={16} />Edit profile</button>}</div></div>
		{feedback.message && <div className={`alert ${feedback.type === 'error' ? 'error' : ''}`}>{feedback.message}</div>}
		<section className="profile-summary"><div className="profile-large-avatar">{user?.name?.[0]?.toUpperCase()}</div><div><h2>{user?.name}</h2><p>{user?.role === 'admin' ? 'Operations administrator' : employee?.designation || 'Field employee'}</p></div><span className="profile-role"><ShieldCheck size={15} />{user?.role}</span></section>
		<form id="profile-form" onSubmit={saveProfile} className="profile-grid">
			<section className="profile-panel"><h2>Contact details</h2>{editing ? <div className="profile-edit-fields"><label>Full name<input name="name" value={form.name} onChange={changeField} required /></label><label>Email address<input type="email" name="email" value={form.email} onChange={changeField} required /></label><label>Phone number<input name="phone" value={form.phone} onChange={changeField} /></label></div> : <div className="profile-details"><Detail icon={UserRound} label="Full name" value={user?.name} /><Detail icon={Mail} label="Email address" value={user?.email} /><Detail icon={Phone} label="Phone number" value={user?.phone} /></div>}</section>
			<section className="profile-panel"><h2>Work details</h2>{employee ? editing ? <div className="profile-edit-fields"><Detail icon={BriefcaseBusiness} label="Employee code" value={employee.employeeCode} /><Detail icon={BriefcaseBusiness} label="Department" value={employee.department} /><Detail icon={CalendarDays} label="Joining date" value={formatDate(employee.joiningDate)} /><label>Address<textarea name="address" value={form.address} onChange={changeField} rows="2" /></label><label>Emergency contact<input name="emergencyContact" value={form.emergencyContact} onChange={changeField} /></label></div> : <div className="profile-details"><Detail icon={BriefcaseBusiness} label="Employee code" value={employee.employeeCode} /><Detail icon={BriefcaseBusiness} label="Department" value={employee.department} /><Detail icon={CalendarDays} label="Joining date" value={formatDate(employee.joiningDate)} /><Detail icon={MapPin} label="Address" value={employee.address} /></div> : <p className="profile-empty">Your administrator account has access to the full operations workspace.</p>}</section>
		</form>
		{employee?.skills?.length > 0 && <section className="profile-panel profile-skills"><h2>Skills</h2><div className="profile-tags">{employee.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></section>}
	</div>;
}
