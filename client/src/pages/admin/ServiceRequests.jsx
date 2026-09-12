import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { ServiceRequestCard } from '../../components/service/ServiceRequestCard';
import { ServiceRequestForm } from '../../components/service/ServiceRequestForm';
import { Loader } from '../../components/common/Loader';
import { getLifts } from '../../services/liftService';
import { getEmployees } from '../../services/employeeService';
import { createServiceRequest, getServiceRequests, updateServiceRequest } from '../../services/serviceRequestService';
import { useFetch } from '../../hooks/useFetch';

export default function ServiceRequests() { const requests = useFetch(getServiceRequests, []); const [lifts, setLifts] = useState([]); const [employees, setEmployees] = useState([]); const [editing, setEditing] = useState(null); const [notice, setNotice] = useState(''); useEffect(() => { Promise.all([getLifts(), getEmployees()]).then(([a, b]) => { setLifts(a); setEmployees(b); }).catch((e) => setNotice(e.message)); }, []); const save = async (data) => { try { await (editing?._id ? updateServiceRequest(editing._id, data) : createServiceRequest(data)); setEditing(null); setNotice('Service request saved.'); requests.reload(); } catch (e) { setNotice(e.message); } }; return <><div className="page-heading action-heading"><div><span className="eyebrow">Work orders</span><h1>Service requests</h1><p>Assign and progress every inspection, repair, and callout.</p></div><button onClick={() => setEditing({})}><Plus size={18} /> New request</button></div>{notice && <div className="alert">{notice}</div>}{editing && <section className="form-card"><h2>{editing._id ? 'Update request' : 'New service request'}</h2><ServiceRequestForm initial={editing} lifts={lifts} employees={employees} admin onSave={save} onCancel={() => setEditing(null)} /></section>}{requests.loading ? <Loader /> : <div className="card-grid service-grid">{requests.data.map((request) => <ServiceRequestCard key={request._id} request={request} onUpdate={setEditing} />)}</div>}</>; }

