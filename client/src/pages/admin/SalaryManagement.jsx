import { SalarySlipCard } from '../../components/salary/SalarySlipCard';
import { SalarySlipForm } from '../../components/salary/SalarySlipForm';
import { Loader } from '../../components/common/Loader';
import { createSalarySlip, getSalarySlips, updateSalarySlip } from '../../services/salaryService';
import { getEmployees } from '../../services/employeeService';
import { useFetch } from '../../hooks/useFetch';
import { useEffect, useState } from 'react';

export default function SalaryManagement() { const slips = useFetch(getSalarySlips, []); const [employees, setEmployees] = useState([]); const [notice, setNotice] = useState(''); const [updatingId, setUpdatingId] = useState(''); useEffect(() => { getEmployees().then(setEmployees).catch((e) => setNotice(e.message)); }, []); const save = async (form) => { try { await createSalarySlip(form); setNotice('Salary slip created.'); slips.reload(); } catch (e) { setNotice(e.message); } }; const changeStatus = async (slip, status) => { setUpdatingId(slip._id); setNotice(''); try { await updateSalarySlip(slip._id, { status }); setNotice(status === 'paid' ? 'Salary marked as paid.' : 'Salary marked as not paid.'); slips.reload(); } catch (e) { setNotice(e.message); } finally { setUpdatingId(''); } }; return <><div className="page-heading"><div><span className="eyebrow">Payroll</span><h1>Salary management</h1><p>Issue clear monthly payroll records for the field team.</p></div></div>{notice && <div className="alert">{notice}</div>}<section className="form-card"><h2>Create salary slip</h2><SalarySlipForm employees={employees} onSave={save} /></section>{slips.loading ? <Loader /> : <div className="card-grid salary-grid">{slips.data.map((slip) => <SalarySlipCard key={slip._id} slip={slip} onStatusChange={changeStatus} updating={updatingId === slip._id} />)}{!slips.data.length && <p className="empty-state">No salary slips issued yet.</p>}</div>}</>; }

