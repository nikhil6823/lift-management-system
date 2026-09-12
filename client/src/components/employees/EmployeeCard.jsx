import { BriefcaseBusiness, Mail, Phone, UserMinus } from 'lucide-react';
export function EmployeeCard({ employee, onRemove }) {
  const inactive = employee.user?.active === false;
  return <article className={`employee-card ${inactive ? 'employee-inactive' : ''}`}><span className="avatar">{employee.user?.name?.[0]}</span><div><div className="card-row"><div><h3>{employee.user?.name}</h3><span className="eyebrow">{employee.employeeCode}</span></div><span className="badge">{inactive ? 'Removed' : 'Active'}</span></div><p><BriefcaseBusiness size={15} /> {employee.designation}</p><p><Mail size={15} /> {employee.user?.email}</p>{employee.user?.phone && <p><Phone size={15} /> {employee.user.phone}</p>}{!inactive && <button className="text-button employee-remove" onClick={() => onRemove(employee)}><UserMinus size={15} /> Remove employee</button>}</div></article>;
}

