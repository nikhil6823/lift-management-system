import { SalarySlipCard } from '../../components/salary/SalarySlipCard';
import { Loader } from '../../components/common/Loader';
import { getSalarySlips } from '../../services/salaryService';
import { useFetch } from '../../hooks/useFetch';
export default function MySalarySlips() { const { data, loading, error } = useFetch(getSalarySlips, []); return <><div className="page-heading"><div><span className="eyebrow">Pay records</span><h1>My salary slips</h1><p>Your issued and paid payroll records appear here.</p></div></div>{error && <div className="alert error">{error}</div>}{loading ? <Loader /> : <div className="card-grid salary-grid">{data.map((slip) => <SalarySlipCard key={slip._id} slip={slip} />)}{!data.length && <p className="empty-state">No salary slips available yet.</p>}</div>}</>; }
