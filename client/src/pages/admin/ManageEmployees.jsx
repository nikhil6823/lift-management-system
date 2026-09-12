import { useState } from 'react';
import { Plus } from 'lucide-react';
import { EmployeeForm } from '../../components/employees/EmployeeForm';
import { EmployeeList } from '../../components/employees/EmployeeList';
import { Loader } from '../../components/common/Loader';
import { createEmployee, getEmployees, removeEmployee } from '../../services/employeeService';
import { useFetch } from '../../hooks/useFetch';

export default function ManageEmployees() { const { data, loading, error, reload } = useFetch(getEmployees, []); const [adding, setAdding] = useState(false); const [notice, setNotice] = useState(''); const save = async (form) => { try { await createEmployee(form); setAdding(false); setNotice('Employee added.'); reload(); } catch (reason) { setNotice(reason.message); } }; const remove = async (employee) => { if (!window.confirm(`Remove ${employee.user?.name || 'this employee'}? Their historical records will be preserved.`)) return; try { await removeEmployee(employee._id); setNotice('Employee removed and account access disabled.'); reload(); } catch (reason) { setNotice(reason.message); } }; return <><div className="page-heading action-heading"><div><span className="eyebrow">Field team</span><h1>Manage employees</h1><p>Provision technicians and keep skills and payroll details current.</p></div><button onClick={() => setAdding(true)}><Plus size={18} /> Add employee</button></div>{notice && <div className="alert">{notice}</div>}{adding && <section className="form-card"><h2>New employee</h2><EmployeeForm onSave={save} onCancel={() => setAdding(false)} /></section>}{error && <div className="alert error">{error}</div>}{loading ? <Loader /> : <EmployeeList employees={data} onRemove={remove} />}</>; }
